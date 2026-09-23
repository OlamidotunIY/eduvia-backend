# 01 — IAM & Auth

> **Modules:** `src/modules/auth` + `src/modules/user`
> **Status:** Core flow built. ParentProfile and StudentProfile aggregate roots built.

---

## Overview

The IAM & Auth module is the identity backbone of Eduvia. It handles:

- User registration (parent-initiated; teachers and students cannot self-register)
- Email verification via OTP
- Authentication: password login, session management, JWT access + refresh tokens
- Device-level session tracking and per-device revocation
- TOTP two-factor authentication
- Credential updates, password reset
- Parent-child student profile management

---

## Module Boundaries

| Module | Owns | Does NOT own |
|---|---|---|
| `auth` | AuthAccount, Session, Verification, TwoFactor aggregates | User identity, profiles |
| `user` | User, ParentProfile, StudentProfile aggregates | Credentials, sessions |

Cross-module communication:
- **`auth → user`**: via domain events (`AuthAccountCreatedEvent`, `AccountSuspendedEvent`) → BullMQ `user-events` queue → `UserEventsProcessor`
- **`user → auth`**: via domain events (`UserCreatedEvent`) → BullMQ `auth-events` queue → `AuthEventsProcessor`
- **`auth` reads `user`**: via `IUserQueryPort` (defined in `shared/application/port/`) — never directly accessing `UserRepository`

---

## Domain Models

### 1. User (Aggregate Root) — `user` module

Global platform identity. Not org-scoped.

```
User
  id:              UUIDv7
  userType:        student | teacher | admin | parent
  firstName:       string
  lastName:        string
  email:           string (unique, lowercase)
  emailVerified:   boolean
  twoFactorEnabled: boolean
  status:          active | suspended
  createdAt:       DateTime
  updatedAt:       DateTime
```

**Domain Methods:**
- `User.create(params)` — validates email, name; emits `UserCreatedEvent`
- `user.updateProfile(params)` — updates name fields
- `user.suspend()` — throws if already suspended
- `user.activate()` — idempotent
- `user.markEmailVerified()` — sets `emailVerified = true`
- `user.isTeacher()`, `user.isParent()`, `user.isStudent()`, `user.isAdmin()` — type guards

---

### 2. AuthAccount (Aggregate Root) — `auth` module

Holds authentication credentials and status. Linked 1:1 to a User after email verification.

```
AuthAccount
  id:             UUIDv7
  userId:         UUID? (null until email verified and User record created)
  email:          string
  credentialHash: string (bcrypt hashed password)
  scope:          string (e.g. "parent:self")
  totpSecret:     string? (null if TOTP not enabled)
  totpEnabled:    boolean
  authStatus:     active | suspended | pending_email_verification | pending_password_reset
  createdAt:      DateTime
  updatedAt:      DateTime
```

**Domain Methods:**
- `AuthAccount.create(params)` — sets status to `pending_email_verification`; emits `AuthAccountCreatedEvent` (carries preAuthToken + profileData for downstream User creation)
- `authAccount.linkUser(userId)` — links to User record after email verification; throws if already linked
- `authAccount.activate()` — idempotent
- `authAccount.suspend(correlationId)` — emits `AccountSuspendedEvent`; throws `AuthAccountAlreadySuspendedError`
- `authAccount.updateCredentials(credentialHash)` — validates non-empty hash
- `authAccount.markPendingPasswordReset()` — throws if suspended
- `authAccount.enableTotp(secret)` — throws if already enabled
- `authAccount.disableTotp()` — idempotent
- `authAccount.canAuthenticate()` — throws if suspended; returns false if pending verification
- `authAccount.isPendingEmailVerification()`, `authAccount.isSuspended()`, `authAccount.isActive()`

---

### 3. Session (Aggregate Root) — `auth` module

One session = one device login. Holds the refresh token hash and expiry.

```
Session
  id:         UUIDv7
  expiresAt:  DateTime
  token:      string (unique — the raw refresh token)
  ipAddress:  string?
  userAgent:  string?
  userId:     string
  createdAt:  DateTime
  updatedAt:  DateTime
```

**Domain Methods:**
- `Session.create(params)` — validates token non-empty
- `session.extend(newExpiresAt)` — extends expiry; throws if new date is not in the future
- `session.isExpired()` — checks wall-clock vs `expiresAt`

---

### 4. Verification (Aggregate Root) — `auth` module

Tracks a one-time verification challenge (email OTP, password reset OTP).

```
Verification
  id:                 UUIDv7
  identifier:         string (email address)
  valueHash:          string (bcrypt hashed OTP)
  verificationType:   email_verification | password_reset | ...
  verificationStatus: pending | verified | failed
  expiresAt:          DateTime
  attempts:           int (default 0)
  maxAttempts:        int
  createdAt:          DateTime
  updatedAt:          DateTime
```

**Domain Methods:**
- `Verification.create(params)` — emits `AuthVerificationCreatedEvent`
- `verification.recordAttempt()` — increments attempts; marks `FAILED` if maxAttempts reached; throws if expired
- `verification.markAsVerified()` — throws if expired or max attempts exceeded; sets status `VERIFIED`
- `verification.isExpired()` — wall-clock check

---

### 5. TwoFactor (Aggregate Root) — `auth` module

Stores TOTP secret and backup codes per user.

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
  userId:      UUID (FK → User)
  phoneNumber: string?
  createdAt:   DateTime
  updatedAt:   DateTime
```

**Domain Methods:**
- `ParentProfile.create(params)` — trims phoneNumber
- `parentProfile.updateProfile(params)` — updates phoneNumber

---

### 7. StudentProfile (Aggregate Root) — `user` module

Represents a child registered by a parent.

```
StudentProfile
  id:          UUIDv7
  parentId:    UUID (FK → ParentProfile)
  dateOfBirth: Date
  countryCode: string (ISO 3166-1 alpha-2, e.g. "GB", "NG")
  timezone:    string (IANA tz)
  gradeLevel:  string?
  createdAt:   DateTime
  updatedAt:   DateTime
```

**Domain Methods:**
- `StudentProfile.create(params)` — validates non-empty countryCode and timezone; throws `StudentProfileInvariantError`
- `studentProfile.updateProfile(params)` — validates updated fields

---

## Domain Events

| Event | Emitted By | Queue | Consumer |
|---|---|---|---|
| `AuthAccountCreatedEvent` | `AuthAccount.create` | `user-events` | `UserEventsProcessor` → creates User + ParentProfile |
| `AccountSuspendedEvent` | `authAccount.suspend` | `user-events` | `UserEventsProcessor` → suspends User |
| `AuthVerificationCreatedEvent` | `Verification.create` | `notification-events` | Send OTP email |
| `AuthEmailVerifiedEvent` | `CompleteVerificationCommand` handler | `user-events` | `UserEventsProcessor` → marks user email verified |
| `UserCreatedEvent` | `User.create` | `auth-events` | `AuthEventsProcessor` → links User to AuthAccount |

---

## Commands (auth module)

| Command | Handler | Description |
|---|---|---|
| `CreateAuthAccountCommand` | `CreateAuthAccountHandler` | Creates AuthAccount (pending_email_verification) + Verification OTP |
| `CompleteVerificationCommand` | `CompleteVerificationHandler` | Verifies OTP, activates AuthAccount, emits `AuthEmailVerifiedEvent` |
| `LoginCommand` | `LoginHandler` | Validates credentials, creates Session, issues tokens |
| `LogoutCommand` | `LogoutHandler` | Revokes current Session by token |
| `RevokeAllSessionsCommand` | `RevokeAllSessionsHandler` | Revokes all Sessions for a userId |
| `ResendOtpCommand` | `ResendOtpHandler` | Creates new Verification, emits for email delivery |
| `ChangePasswordCommand` | `ChangePasswordHandler` | Hashes new password, calls `authAccount.updateCredentials()` |
| `RequestPasswordResetCommand` | `RequestPasswordResetHandler` | Creates password-reset Verification |

---

## Commands (user module)

| Command | Handler | Description |
|---|---|---|
| `CreateUserCommand` | `CreateUserHandler` | Creates User + ParentProfile (triggered by `AuthAccountCreatedEvent`) |
| `RegisterStudentCommand` | `RegisterStudentHandler` | Parent creates a StudentProfile for their child |
| `MarkEmailVerifiedCommand` | `MarkEmailVerifiedHandler` | Marks User email as verified (triggered by `AuthEmailVerifiedEvent`) |

---

## Queries

| Query | Module | Handler | Description |
|---|---|---|---|
| `GetSessionQuery` | `auth` | `GetSessionHandler` | Fetches a Session by token |
| `GetUserByEmailQuery` | `user` | `GetUserByEmailHandler` | Fetches User by email (used by auth via `IUserQueryPort`) |
| `GetUserByIdQuery` | `user` | `GetUserByIdHandler` | Fetches User by ID |

---

## Infrastructure Ports

Interfaces defined in `domain/ports/` — implemented in `infrastructure/services/`:

| Port | Implementation | Description |
|---|---|---|
| `IPasswordHashPort` | `BcryptPasswordHashAdapter` (in `shared/infrastructure/services/`) | Hash + compare passwords |
| `ITokenPort` | `JwtTokenAdapter` | Generate/verify JWT access tokens, refresh tokens, pre-auth tokens |

Cross-module read port (defined in `shared/application/port/`):

| Port | Implementation | Provided By |
|---|---|---|
| `IUserQueryPort` | `UserQueryAdapter` | `user` module — injected by `auth` module |

---

## Repositories

### auth module

| Repository Interface | Implementation | Prisma Delegate |
|---|---|---|
| `IAuthAccountRepository` | `PrismaAuthAccountRepository` | `prisma.authAccount` |
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

Located in `prisma/schema/`:

- `auth.prisma` — AuthAccount, Session, Verification, TwoFactor models + all auth enums
- `user.prisma` — User model + UserType/UserStatus enums
- `parent-profile.prisma` — ParentProfile model
- `student-profile.prisma` — StudentProfile model
- `shared.prisma` — OutboxMessage + DlqMessage models + OutboxStatus/DlqStatus enums

---

## API Surface (Presentation Layer)

### Auth Controller (`/auth`)

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register parent: create AuthAccount + send OTP |
| POST | `/auth/verify-email` | None | Complete OTP verification |
| POST | `/auth/login` | None | Login: validate credentials, issue tokens |
| POST | `/auth/logout` | `JwtAuthGuard` | Revoke current session |
| POST | `/auth/resend-otp` | None | Resend verification OTP |
| POST | `/auth/revoke-all` | `JwtAuthGuard` | Revoke all sessions for account |
| POST | `/auth/change-password` | `JwtAuthGuard` | Change password |
| POST | `/auth/request-password-reset` | None | Request password reset OTP |

### Me Controller (`/me`)

| Method | Path | Guard | Description |
|---|---|---|---|
| GET | `/me` | `JwtAuthGuard` | Get current user profile |

### User Controller (`/users`)

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | `/users/register` | None | Register user (triggers CreateUserCommand) |
| POST | `/users/students` | `JwtAuthGuard` | Register student for a parent |

---

## JWT Token Structure

**Access Token** (`sessionId`, `jti` used for revocation):

```typescript
interface AccessTokenPayload {
  sub: string;        // userId
  sessionId: string;  // Session aggregate ID
  email: string;
  userType: string;
  jti: string;        // unique token ID (for revocation)
  iat: number;
  exp: number;
}
```

**Pre-Auth Token** (issued before email verification is complete):

```typescript
interface PreAuthTokenPayload {
  authAccountId: string;
  purpose: 'email_verification';
  iat: number;
  exp: number;
}
```

Token TTLs are configured via environment variables:
- `JWT_SECRET` — signing secret (required)
- `JWT_ACCESS_TTL` — access token TTL in seconds (default: 900 = 15 min)
- `JWT_REFRESH_TTL` — refresh token TTL in seconds (default: 2592000 = 30 days)
- `PRE_AUTH_TOKEN_TTL` — pre-auth token TTL in seconds (default: 600 = 10 min)
