# 01 — IAM & Auth

> **Module:** `src/modules/auth` + `src/modules/user`
> **Status:** Partially built — AuthAccount, Session, Verification, User aggregates exist. Missing: ParentProfile, StudentProfile.

---

## Overview

The IAM & Auth module is the identity backbone of Eduvia. It handles:

- User registration (parent-initiated; teachers and students cannot self-register)
- Email verification via OTP
- Authentication: password login, session management, JWT access + refresh tokens
- Device-level session tracking and per-device revocation
- TOTP two-factor authentication
- Credential updates and account suspension
- Parent-child student profile management

---

## Domain Models

### 1. User (Aggregate Root) — BUILT

Global platform identity. Not org-scoped.

```
User
  id:          UUID
  userType:    student | teacher | admin | parent
  firstName:   string
  lastName:    string
  email:       string (unique, lowercase)
  status:      active | suspended
  createdAt:   DateTime
  updatedAt:   DateTime
```

**Domain Methods:**
- `User.create(params)` — validates email, name; emits `UserCreatedEvent`
- `user.updateProfile(params)` — emits `UserUpdatedEvent`
- `user.suspend()` — throws `UserAlreadySuspendedError` if already suspended
- `user.activate()` — idempotent
- `user.isTeacher()`, `user.isParent()`, `user.isStudent()`, `user.isAdmin()` — type guards

---

### 2. AuthAccount (Aggregate Root) — BUILT

Holds authentication credentials and status. Linked 1:1 to a User after email verification.

```
AuthAccount
  id:             UUID
  userId:         UUID? (null until email verified and User record created)
  credentialHash: string (bcrypt hashed password)
  scope:          string (e.g. "parent:self" | "teacher:org-invite")
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
- `authAccount.markPendingEmailVerification()` — throws if suspended
- `authAccount.markPendingPasswordReset()` — throws if suspended
- `authAccount.enableTotp(secret)` — throws if already enabled
- `authAccount.disableTotp()` — idempotent
- `authAccount.canAuthenticate()` — throws if suspended; returns false if pending verification
- `authAccount.isPendingEmailVerification()`, `authAccount.isSuspended()`, `authAccount.isActive()`

---

### 3. Session (Aggregate Root) — BUILT

One session = one device login. Holds the refresh token hash and expiry.

```
Session
  id:                    UUID
  authAccountId:         UUID
  refreshTokenHash:      string (bcrypt hashed)
  accessTokenExpiresAt:  DateTime
  refreshTokenExpiresAt: DateTime
  ipAddress:             string
  userAgent:             string
  sessionStatus:         active | revoked | expired
  revokedAt:             DateTime?
  createdAt:             DateTime
  updatedAt:             DateTime
```

**Domain Methods:**
- `Session.create(params)` — emits `AuthSessionCreatedEvent` + `TokenIssuedEvent`
- `session.revoke()` — idempotent; sets `revokedAt`
- `session.expire()` — idempotent
- `session.isActive()`, `session.isRevoked()`, `session.isExpired()` — status checks; `isExpired()` also checks `refreshTokenExpiresAt` wall-clock time

---

### 4. Verification (Aggregate Root) — BUILT

Tracks a one-time verification challenge (email OTP, TOTP setup).

```
Verification
  id:                 UUID
  authAccountId:      UUID
  identifier:         string (email address for email verifications)
  valueHash:          string (bcrypt hashed OTP value)
  verificationType:   email_verification | email_otp | totp_setup
  verificationStatus: pending | verified | expired | max_attempts_exceeded
  expiresAt:          DateTime
  attempts:           int (default 0)
  maxAttempts:        int
  createdAt:          DateTime
  updatedAt:          DateTime
```

**Domain Methods:**
- `Verification.create(params)` — emits `AuthVerificationCreatedEvent`; validates non-empty identifier/hash and maxAttempts > 0
- `verification.verify(value, compareValue)` — async; increments attempts; throws on expired, max attempts, or invalid value; sets status to `verified` on success
- `verification.expire()` — idempotent; skips if already verified or exhausted
- `verification.isPending()`, `verification.isVerified()`, `verification.isExpired()`, `verification.hasExceededMaxAttempts()`

---

### 5. ParentProfile (Entity) — TO BUILD

Profile data for parents. Global (not org-scoped).

```
ParentProfile
  id:          UUID
  userId:      UUID (FK -> User)
  phoneNumber: string?
  timezone:    string (IANA tz, e.g. "Europe/London")
  avatarUrl:   string?
  createdAt:   DateTime
  updatedAt:   DateTime

  students: StudentProfile[]
```

---

### 6. StudentProfile (Entity) — TO BUILD

Represents a child registered by a parent.

```
StudentProfile
  id:            UUID
  parentId:      UUID (FK -> ParentProfile)
  firstName:     string
  lastName:      string
  dateOfBirth:   Date
  countryCode:   string (ISO 3166-1 alpha-2, e.g. "GB", "CA", "NG")
  timezone:      string
  gradeLevel:    string? (e.g. "Year 10", "Grade 8")
  avatarUrl:     string?
  status:        active | inactive
  createdAt:     DateTime
  updatedAt:     DateTime

  enrollments:   StudentEnrollment[]  (which classrooms this student is in)
  curriculumProfile: resolved at query time from countryCode
```

**Domain Logic:**
- `countryCode` drives curriculum resolution for ALL subjects the student takes
- A student cannot be enrolled in two classrooms with conflicting time slots
- Student has no auth account by default; parent manages their access

---

## Domain Events

| Event | Emitted By | Payload | Consumer |
|---|---|---|---|
| `AuthAccountCreatedEvent` | AuthAccount.create | authAccountId, preAuthToken, profileData | user-events (create User + ParentProfile) |
| `AccountSuspendedEvent` | authAccount.suspend | authAccountId, userId | user-events (suspend User) |
| `AuthSessionCreatedEvent` | Session.create | authAccountId | (audit log) |
| `TokenIssuedEvent` | Session.create | authAccountId | (audit log) |
| `AuthVerificationCreatedEvent` | Verification.create | verificationId, authAccountId, identifier, type | notification-events (send OTP email) |
| `UserCreatedEvent` | User.create | userId, userType, email, authAccountId? | auth-events (link User to AuthAccount) |
| `UserUpdatedEvent` | user.updateProfile | userId, userType, email | auth-events (update JWT claims cache) |

---

## Domain Logic

Domain logic = rules enforced inside the domain model, independent of infrastructure.

| Rule | Where Enforced |
|---|---|
| An AuthAccount can only be linked to one User | `authAccount.linkUser()` — throws if `userId !== null` |
| A suspended account cannot authenticate | `authAccount.canAuthenticate()` — throws `AuthAccountAlreadySuspendedError` |
| A suspended account cannot be re-suspended | `authAccount.suspend()` — throws if already suspended |
| Verification attempts are bounded | `verification.verify()` — throws after `maxAttempts` exceeded |
| Expired verifications cannot be reused | `verification.verify()` — checks wall-clock vs `expiresAt` |
| OTP identifier must be non-empty | `Verification.create()` — throws `AuthInvariantError` |
| Sessions track wall-clock expiry independent of status | `session.isExpired()` — checks `refreshTokenExpiresAt` directly |
| Student countryCode determines their curriculum — no per-subject override | ParentProfile domain service |

---

## Business Actions

Business actions = application-layer operations that coordinate domain objects.

### Implemented

| Action | Command | Handler |
|---|---|---|
| Register a parent account | `CreateAuthAccountCommand` | Creates AuthAccount (pending_email_verification) + Verification (OTP) |
| Complete email OTP verification | `CompleteVerificationCommand` | Verifies OTP, activates AuthAccount, triggers User creation |
| Login | `LoginCommand` | Validates credentials, handles pending verification, creates Session + issues tokens |
| Logout | `LogoutCommand` | Revokes current Session |
| Revoke all sessions | `RevokeAllSessionsCommand` | Revokes all Sessions for an AuthAccount |
| Issue new auth tokens (refresh) | `IssueAuthTokensCommand` | Validates refresh token, creates new Session |
| Resend OTP | `ResendOtpCommand` | Creates new Verification record, emits for email delivery |
| Update credentials (password) | `UpdateCredentialsCommand` | Hashes new password, calls `authAccount.updateCredentials()` |
| Suspend account | `SuspendAuthAccountCommand` | Calls `authAccount.suspend()`, revokes all sessions |

### To Build

| Action | Notes |
|---|---|
| Register student (by parent) | Parent creates StudentProfile for their child; no auth account created |

---

## Infrastructure Ports

Interfaces defined in `domain/ports/` — implemented in `infrastructure/services/`:

| Port | Implementation | Description |
|---|---|---|
| `IPasswordHashPort` | `BcryptPasswordHashAdapter` | Hash + compare passwords (bcrypt) |
| `ITokenPort` | `JwtTokenAdapter` | Generate/verify access tokens, refresh tokens, pre-auth tokens |
| `IOtpPort` | `CryptoOtpAdapter` | Generate + hash OTP codes (crypto random) |
| `ITotpPort` | `SpeakeasyTotpAdapter` | Generate TOTP secrets, verify TOTP codes |
| `ITokenRevocationPort` | `RedisTokenRevocationAdapter` | Blocklist revoked access tokens in Redis |

---

## Repositories

| Repository | Interface | Implementation | Scope |
|---|---|---|---|
| AuthAccount | `IAuthAccountRepository` | `PrismaAuthAccountRepository` | Global |
| Session | `ISessionRepository` | `PrismaSessionRepository` | Global |
| Verification | `IVerificationRepository` | `PrismaVerificationRepository` | Global |
| User | `IUserRepository` | `PrismaUserRepository` | Global |
| ParentProfile | `IParentProfileRepository` | To build | Global |
| StudentProfile | `IStudentProfileRepository` | To build | Global |

---

## Prisma Schema (Existing)

Located in `prisma/schema/`:

- `user.prisma` — User model + UserType/UserStatus enums
- `auth-account.prisma` — AuthAccount model + AuthStatus enum
- `session.prisma` — Session model + SessionStatus enum
- `verification.prisma` — Verification model + VerificationType/VerificationStatus enums
- `outbox-message.prisma` — OutboxMessage model + OutboxStatus enum

**To add:**
- `parent-profile.prisma` — ParentProfile model
- `student-profile.prisma` — StudentProfile model
- Update `user.prisma` to add relations to ParentProfile

---

## WebSocket Events (IAM)

IAM does not have real-time WebSocket events. Auth events are REST-only. Session changes (revoke, expire) may trigger push notifications via the Notifications module.

---

## API Surface (Presentation Layer)

### Existing Endpoints (via AuthService + controllers)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | None | Register parent: create AuthAccount + send OTP |
| POST | /auth/verify-email | PreAuth token | Complete OTP verification |
| POST | /auth/login | None | Login: validate credentials, issue tokens |
| POST | /auth/logout | Access token | Revoke current session |
| POST | /auth/refresh | Refresh token | Issue new access + refresh tokens |
| POST | /auth/resend-otp | PreAuth token | Resend verification OTP |
| POST | /auth/revoke-all | Access token | Revoke all sessions for account |
| PATCH | /auth/credentials | Access token | Update password |

### To Add

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /parents/students | Parent access token | Register a student (child) |
| GET | /parents/students | Parent access token | List parent's students |
