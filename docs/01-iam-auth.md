# 01 — IAM & Auth

> **Modules:** `src/modules/auth` + `src/modules/user`
> **Status:** Core flow built (register → OTP verification → login → logout). ParentProfile, StudentProfile and TeacherProfile aggregates exist. TOTP enable/verify flows and a refresh-token endpoint are not built yet.
>
> Items marked **(planned)** describe the target design and are not in the code yet.

---

## Overview

The IAM & Auth module is the identity backbone of Eduvia. It handles:

- User registration (parents and teachers self-register; students are registered by a parent)
- Email verification via OTP
- Authentication: password login, session management, JWT access tokens
- Session tracking and revocation
- TOTP two-factor authentication (data model only so far)
- Password change / password reset request
- Parent-child student profile management

---

## Module Boundaries

| Module | Owns | Does NOT own |
|---|---|---|
| `auth` | `Account` (domain aggregate `AuthAccount`), `Session`, `Verification`, `TwoFactor` aggregates | User identity, profiles |
| `user` | `User`, `ParentProfile`, `StudentProfile`, `TeacherProfile` aggregates | Credentials, sessions, organization membership |

Organization membership (`OrganizationMembership`) is owned by the `org` module — see [02-org-marketplace.md](02-org-marketplace.md).

Cross-module communication (all writes via events, reads via shared Query Ports — see [00-ddd-architecture.md](00-ddd-architecture.md)):
- **`user → auth`**: `UserCreatedEvent` → BullMQ `auth-events` queue → `AuthEventProcessor` → `CreateAuthAccountCommand`
- **`auth → user`**: `AuthEmailVerifiedEvent` and `AccountSuspendedEvent` → BullMQ `user-events` queue → `UserEventProcessor` → `MarkEmailVerifiedCommand` / `SuspendUserCommand`
- **`auth` reads `user`**: via `IUserQueryPort` (defined in `shared/application/port/`) — never directly accessing `UserRepository`

Processors live in `infrastructure/messaging/listeners/` of each module; the inbound event shapes they use live in `infrastructure/messaging/events/`.

---

## Registration & Verification Flow

```
1. POST /users/register  { email, password, firstName, lastName, userType, timezone? }
     CreateUserCommand — userType must be parent or teacher
       - hashes the password (bcrypt, IPasswordHashPort)
       - User.create(...) -> emits UserCreatedEvent (carries the password hash)
       - parents also get a ParentProfile
2. UserCreatedEvent -> Outbox -> auth-events -> AuthEventProcessor
     CreateAuthAccountCommand
       - creates a credentials Account (scope = 'user')
       - generates an email-verification OTP (raw code held in Redis 10 min, bcrypt hash in Verification,
         maxAttempts = 5) -> Verification.create emits AuthVerificationCreatedEvent
3. POST /auth/verify-otp  { email, code }
     CompleteVerificationCommand
       - verifies the OTP, marks the Account email as verified -> emits AuthEmailVerifiedEvent
       - creates a Session and returns { sessionId, accessToken, refreshToken, ... }
4. AuthEmailVerifiedEvent -> user-events -> UserEventProcessor -> MarkEmailVerifiedCommand (User.emailVerified = true)
```

Login with an unverified email: `LoginCommand` validates credentials, then — if `User.emailVerified` is false — issues a fresh OTP and fails with `AccountPendingVerificationError` (the client must call `/auth/verify-otp`).

**Students (planned):** a parent registers a child via `POST /users/parents/students`, supplying the child's email and a password. The child gets their own `User` (`userType = student`) linked to the `StudentProfile` via `userId`, and an `Account`. The student verifies their email on **first login** through the same OTP flow above; at first login the student is then *suggested* (not forced) to change the parent-chosen password.

---

## Domain Models

### 1. User (Aggregate Root) — `user` module

Global platform identity. Not org-scoped.

```
User
  id:               UUIDv7
  userType:         student | teacher | admin | parent
  firstName:        string
  lastName:         string
  email:            string (unique, required)
  username:         string? (unique)
  image:            string?
  emailVerified:    boolean
  twoFactorEnabled: boolean?
  status:           active | suspended
  timezone:         string
  createdAt:        DateTime
  updatedAt:        DateTime
```

> `userType = admin` does **not** mean platform admin. Platform admins are identified by the `PlatformAdmin` record (see [11-platform-admin.md](11-platform-admin.md)); their `userType` is one of the normal values.

**Domain Methods:**
- `User.create(params)` — validates email, name; emits `UserCreatedEvent`
- `user.updateProfile(params)` — updates profile fields; emits `UserUpdatedEvent`
- `user.suspend()` — throws if already suspended
- `user.activate()` — idempotent
- `user.markEmailVerified()` — sets `emailVerified = true`
- `user.isTeacher()`, `user.isParent()`, `user.isStudent()`, `user.isAdmin()`, `user.isActive()`, `user.isSuspended()` — type/state guards

---

### 2. Account / AuthAccount (Aggregate Root) — `auth` module

Holds authentication credentials for a user. The Prisma model is `Account` (table `accounts`); the domain aggregate that wraps it is `AuthAccount`. A user has one credentials account (and may have OAuth provider accounts).

```
Account (AuthAccount aggregate)
  id:                    UUIDv7
  accountId:             string (provider-side account id)
  providerId:            string (e.g. "credential" or an OAuth provider)
  userId:                string (FK → User)
  accessToken:           string?
  refreshToken:          string?
  idToken:               string?
  accessTokenExpiresAt:  DateTime?
  refreshTokenExpiresAt: DateTime?
  scope:                 string? (e.g. "user")
  password:              string? (bcrypt hash — credentials accounts)
  createdAt:             DateTime
  updatedAt:             DateTime
```

**Domain Methods:**
- `AuthAccount.createCredentialsAccount(params)` — email/password account
- `AuthAccount.createOAuthAccount(params)` — OAuth provider account
- `AuthAccount.reconstitute(params)` — re-hydrate from persistence
- `authAccount.updateTokens(params)` — updates OAuth tokens
- `authAccount.updatePassword(passwordHash)` — replaces the stored hash
- `authAccount.recordEmailVerified(correlationId, email)` — emits `AuthEmailVerifiedEvent`

---

### 3. Session (Aggregate Root) — `auth` module

One session = one login. The session `token` is a random opaque identifier (32 random bytes, hex), unique per row.

```
Session
  id:         UUIDv7
  expiresAt:  DateTime
  token:      string (unique — random 32-byte hex session token)
  ipAddress:  string?
  userAgent:  string?
  userId:     string
  createdAt:  DateTime
  updatedAt:  DateTime
```

The refresh token is generated by `ITokenPort.generateRefreshToken()` as `{ raw, hash (bcrypt), expiresAt }`: the **raw** value is returned to the client and `expiresAt` becomes `Session.expiresAt`. The hash is **not** persisted today, and there is no refresh endpoint yet.

**Domain Methods:**
- `Session.create(params)` — validates token non-empty
- `session.extend(newExpiresAt)` — extends expiry; throws if new date is not in the future
- `session.isExpired()` — checks wall-clock vs `expiresAt`

There is no `revoke()` method: logout deletes the session row (`sessionRepository.delete`) and blocklists the access token's `jti` in Redis.

---

### 4. Verification (Aggregate Root) — `auth` module

Tracks a one-time verification challenge (email OTP, password reset, TOTP setup).

```
Verification
  id:                 UUIDv7
  identifier:         string (email address)
  valueHash:          string (bcrypt hashed OTP)
  verificationType:   email_verification | email_otp | password_reset | totp_setup
  verificationStatus: pending | verified | expired | max_attempts_exceeded
  expiresAt:          DateTime
  attempts:           int (default 0)
  maxAttempts:        int
  createdAt:          DateTime
  updatedAt:          DateTime
```

**Domain Methods:**
- `Verification.create(params)` — emits `AuthVerificationCreatedEvent`
- `verification.recordAttempt()` — increments attempts; sets `max_attempts_exceeded` when `maxAttempts` is reached; throws if expired
- `verification.markAsVerified()` — throws if expired or max attempts exceeded; sets status `verified`
- `verification.isExpired()` — wall-clock check

---

### 5. TwoFactor (Aggregate Root) — `auth` module

Stores TOTP secret and backup codes per user. (Enable/verify command flows are not built yet.)

```
TwoFactor
  id:          UUIDv7
  secret:      string (TOTP secret)
  backupCodes: string (stringified/hashed backup codes)
  userId:      string
```

**Domain Methods:**
- `TwoFactor.create(params)` — validates non-empty secret and backup codes
- `twoFactor.updateBackupCodes(newBackupCodes)` — replaces backup codes

---

### 6. ParentProfile (Aggregate Root) — `user` module

Profile data for parents. Global (not org-scoped).

```
ParentProfile
  id:          UUIDv7
  userId:      UUID (FK → User, unique)
  phoneNumber: string?
  createdAt:   DateTime
  updatedAt:   DateTime
```

**Domain Methods:**
- `ParentProfile.create(params)` — trims phoneNumber
- `parentProfile.updateProfile(params)` — updates phoneNumber

---

### 7. StudentProfile (Aggregate Root) — `user` module

Represents a child registered by a parent. Names and email come from the student's own `User`.

```
StudentProfile
  id:           UUIDv7
  parentId:     UUID (FK → ParentProfile)
  userId:       UUID (FK → User, unique)            ← planned (not in the schema yet)
  curriculumId: UUID? (FK → CurriculumProfile)      ← planned; only for ambiguous curricula (IB, Ontario)
  dateOfBirth:  Date
  countryCode:  string (ISO 3166-1 alpha-2, e.g. "GB", "NG")
  timezone:     string (IANA tz)
  gradeLevel:   string?
  createdAt:    DateTime
  updatedAt:    DateTime
```

The student's curriculum is resolved from `countryCode` + `gradeLevel` (see [06-curriculum-graph.md](06-curriculum-graph.md)); `curriculumId` is only set when the parent/student must choose explicitly.

**Domain Methods:**
- `StudentProfile.create(params)` — validates non-empty countryCode and timezone; throws `StudentProfileInvariantError`
- `studentProfile.updateProfile(params)` — validates updated fields

---

### 8. TeacherProfile (Aggregate Root) — `user` module

Professional profile for teachers. Global (not org-scoped).

```
TeacherProfile
  id:                   UUIDv7
  userId:               UUID (FK → User, unique)
  bio:                  string?
  phoneNumber:          string?
  avatarUrl:            string?
  qualification:        string
  yearOfExperience:     int
  subjects:             Json (array of subject identifiers)
  activeOrganizationId: UUID?
  createdAt:            DateTime
  updatedAt:            DateTime
```

> `CreateUserCommand` creates a `ParentProfile` for parents only; it does not create a `TeacherProfile` today.

**Domain Methods:**
- `TeacherProfile.create(params)` / `TeacherProfile.reconstitute(params)`

---

## Domain Events

| Event | Emitted By | Queue | Consumer |
|---|---|---|---|
| `UserCreatedEvent` | `User.create` | `auth-events` | `AuthEventProcessor` → creates the credentials Account + OTP |
| `UserUpdatedEvent` | `user.updateProfile` | `auth-events` | (routed; no handler yet) |
| `AuthVerificationCreatedEvent` | `Verification.create` | `notification-events` **(planned — not routed in code yet)** | Send OTP email (template `account_verification`) |
| `AuthEmailVerifiedEvent` | `authAccount.recordEmailVerified` | `user-events` | `UserEventProcessor` → marks user email verified |
| `AuthAccountCreatedEvent` | — | `user-events` | Routed in code; no emitting method in the current flow |
| `AccountSuspendedEvent` | — | `user-events` | `UserEventProcessor` → suspends User (routed and handled; no emitting method in the current `AuthAccount`) |

---

## Commands (auth module)

| Command | Handler | Description |
|---|---|---|
| `CreateAuthAccountCommand` | `CreateAuthAccountHandler` | Creates the credentials Account + email-verification OTP (triggered by `UserCreatedEvent`) |
| `CompleteVerificationCommand` | `CompleteVerificationHandler` | Verifies OTP, records email verified (emits `AuthEmailVerifiedEvent`), creates Session, issues tokens |
| `LoginCommand` | `LoginHandler` | Validates credentials; if email unverified issues a new OTP and fails; otherwise creates Session and issues tokens |
| `LogoutCommand` | `LogoutHandler` | Deletes the current Session and blocklists the access token `jti` |
| `RevokeAllSessionsCommand` | `RevokeAllSessionsHandler` | Revokes all Sessions for a userId (no HTTP route yet) |
| `ResendOtpCommand` | `ResendOtpHandler` | Creates new Verification, emits for email delivery |
| `ChangePasswordCommand` | `ChangePasswordHandler` | Hashes new password, calls `authAccount.updatePassword()` |
| `RequestPasswordResetCommand` | `RequestPasswordResetHandler` | Creates password-reset Verification |

---

## Commands (user module)

| Command | Handler | Description |
|---|---|---|
| `CreateUserCommand` | `CreateUserHandler` | Registers a parent or teacher: creates User (+ ParentProfile for parents); emits `UserCreatedEvent` |
| `RegisterStudentCommand` | `RegisterStudentHandler` | Parent creates a StudentProfile for their child |
| `UpdateUserCommand` | `UpdateUserHandler` | Updates user profile fields |
| `MarkEmailVerifiedCommand` | `MarkEmailVerifiedHandler` | Marks User email as verified (triggered by `AuthEmailVerifiedEvent`) |
| `SuspendUserCommand` | `SuspendUserHandler` | Suspends the User (triggered by `AccountSuspendedEvent`) |

---

## Queries

| Query | Module | Handler | Description |
|---|---|---|---|
| `GetSessionQuery` | `auth` | `GetSessionHandler` | Fetches a Session |
| `GetUserByEmailQuery` | `user` | `GetUserByEmailHandler` | Fetches User by email (used by auth via `IUserQueryPort`) |
| `GetUserByIdQuery` | `user` | `GetUserByIdHandler` | Fetches User by ID |

---

## Infrastructure Ports

Auth-specific ports are defined in `domain/ports/` and implemented in `infrastructure/services/`:

| Port | Implementation | Description |
|---|---|---|
| `ITokenPort` | `JwtTokenAdapter` | Generate/verify JWT access tokens, refresh tokens (`{ raw, hash, expiresAt }`), pre-auth tokens |
| `IOtpPort` | OTP adapter | Generates `{ code, hash }` for email OTPs |
| `ITokenRevocationPort` | Redis adapter | Blocklists an access token `jti` (`revoked:{jti}`) |

Cross-module ports (defined in `shared/application/port/`):

| Port | Implementation | Provided By |
|---|---|---|
| `IPasswordHashPort` | `BcryptPasswordHashAdapter` | `shared` — hash + compare passwords (bcrypt) |
| `IUserQueryPort` | `UserQueryAdapter` | `user` module — injected by `auth` module |

---

## Repositories

### auth module

| Repository Interface | Implementation | Prisma Delegate |
|---|---|---|
| `IAuthAccountRepository` | `PrismaAuthAccountRepository` | `prisma.account` |
| `ISessionRepository` | `PrismaSessionRepository` | `prisma.session` |
| `IVerificationRepository` | `PrismaVerificationRepository` | `prisma.verification` |

### user module

| Repository Interface | Implementation | Prisma Delegate |
|---|---|---|
| `IUserRepository` | `PrismaUserRepository` | `prisma.user` |
| `IParentProfileRepository` | `PrismaParentProfileRepository` | `prisma.parentProfile` |
| `IStudentProfileRepository` | `PrismaStudentProfileRepository` | `prisma.studentProfile` |

All repositories extend `PrismaBaseRepository` — `save()` writes the entity + outbox messages atomically in one `$transaction`.

---

## Prisma Schema

Located in `prisma/schema/` (MySQL / MariaDB datasource, `@prisma/adapter-mariadb`):

- `auth.prisma` — Account, Session, Verification, TwoFactor models + auth enums (`VerificationType`, `VerificationStatus`)
- `user.prisma` — User model + UserType/UserStatus enums
- `parent-profile.prisma` — ParentProfile model
- `student-profile.prisma` — StudentProfile model
- `teacher-profile.prisma` — TeacherProfile model
- `outbox-message.prisma` — OutboxMessage model + OutboxStatus enum (`PENDING`, `PROCESSED`)

---

## API Surface (Presentation Layer)

### Auth Controller (`/auth`)

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/auth/login` | None | Login: validate credentials, issue tokens (or issue OTP if email unverified) |
| POST | `/auth/verify-otp` | None | Complete OTP verification; returns session + tokens |
| POST | `/auth/resend-otp` | None | Resend verification OTP |
| POST | `/auth/request-password-reset` | None | Request password reset OTP |
| POST | `/auth/change-password` | None (as built) | Change password |
| POST | `/logout` | `AuthGuard` | Logout current session (served by the me controller, empty controller path) |

### User Controller (`/users`)

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/users/register` | None | Register a parent or teacher (`CreateUserCommand`) |
| GET | `/users/me` | `AuthGuard` | Get current user profile |
| POST | `/users/parents/students` | `AuthGuard` | Parent registers a student |

---

## JWT Token Structure

**Access Token** (`sessionId`, `jti` used for revocation; signed with `@nestjs/jwt` / `JWT_SECRET`):

```typescript
interface AccessTokenPayload {
  sub: string;        // Account (AuthAccount) ID
  userId: string;     // User ID
  userType: string;
  scope: string;      // e.g. "user"
  sessionId: string;  // Session aggregate ID
  jti: string;        // unique token ID (for revocation)
  iat: number;
  exp: number;
}
```

The token carries **no** `orgId`, `role`, `email` or `deviceId`. Organization context is resolved per request: REST uses the `:organizationId` path param plus an `OrganizationMembership` check; WebSocket uses an `orgId` in the join payload, validated against `OrganizationMembership`.

`AuthGuard` verifies the JWT and then checks Redis: the `jti` must not be blocklisted (`revoked:{jti}`) and the session must exist (`auth:session:{sessionId}`).

**Pre-Auth Token** (defined by `ITokenPort`; not used by the current registration flow):

```typescript
interface PreAuthTokenPayload {
  authAccountId: string;
  purpose: 'email_verification';
  iat: number;
  exp: number;
}
```

Environment variables:
- `JWT_SECRET` — signing secret (required)
- `JWT_ACCESS_TTL` — access token TTL in seconds (default: 900 = 15 min)
- `JWT_REFRESH_TTL` — refresh token TTL in seconds (default: 2592000 = 30 days)
- `PRE_AUTH_TOKEN_TTL` — pre-auth token TTL in seconds (default: 600 = 10 min)
- `BCRYPT_SALT_ROUNDS` — bcrypt cost (default: 12)
