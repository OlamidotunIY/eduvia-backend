# 08 — Notifications & Messaging

> **Module:** `src/modules/notifications`
> **Status:** To build.
> **NestJS Module:** `NotificationsModule`

---

## Overview

The Notifications & Messaging module handles all real-time and async communication on the Eduvia platform:

- **In-app notifications** — real-time via WebSocket (`/notifications` namespace)
- **Push notifications** — via Firebase Cloud Messaging (FCM)
- **Email notifications** — via SendGrid/Resend (transactional)
- **In-platform chat** — threading between student↔teacher and parent↔admin only

**Communication rules:**
- Teachers and students can message each other directly (student can initiate a question)
- Parents communicate ONLY with org admins — not teachers directly
- Admins relay information between parents and teachers
- Students can request help from within the platform (lesson request / help request)

---

## Domain Models

### 1. Notification (Aggregate Root)

An in-app notification record. Always persisted; real-time delivery attempted via WebSocket with FCM push fallback.

```
Notification
  id:           UUID
  recipientId:  UUID (userId — who receives this)
  type:         NotificationType (enum — see below)
  title:        string
  body:         string
  data:         JSON (type-specific payload — e.g. { lessonId, reportId })
  channel:      in_app | push | email | all
  status:       unread | read
  deliveredAt:  DateTime? (when WS/push was sent)
  readAt:       DateTime?
  createdAt:    DateTime
```

**Domain Methods:**
- `Notification.create(params)` — creates notification record
- `notification.markRead()` — sets `status = read`, `readAt = now()`
- `notification.markDelivered()` — sets `deliveredAt = now()`

---

### 2. NotificationType (Enum)

```
NotificationType:
  // Lesson events
  lesson_scheduled
  lesson_reminder_24h
  lesson_reminder_1h
  lesson_started
  lesson_cancelled
  lesson_rescheduled
  lesson_no_show

  // Assessment + reports
  report_submitted           (parent receives — lesson report available)
  report_ai_draft_ready      (teacher receives — AI draft ready for review)
  marking_pending            (teacher receives — lessons awaiting marking)
  
  // Org events
  teacher_application_received   (admin)
  teacher_application_result     (teacher — approved or rejected)
  org_invitation_sent            (teacher/parent)
  org_approved                   (org owner)

  // Billing
  subscription_created
  subscription_renewed
  subscription_payment_failed
  subscription_cancelled

  // Messages
  new_message

  // System
  account_verification
  password_reset
```

---

### 3. Conversation (Aggregate Root)

A messaging thread between participants. Context-aware — always linked to an org.

```
Conversation
  id:           UUID
  orgId:        UUID
  type:         student_teacher | parent_admin
  participants: UUID[] (userIds — exactly 2 for all MVP conversation types)
  studentId:    UUID? (for student_teacher type)
  parentId:     UUID? (for parent_admin type)
  subject:      string? (optional topic, e.g. "Question about Lesson #42")
  status:       active | closed
  lastMessageAt: DateTime?
  createdAt:    DateTime
  updatedAt:    DateTime

  messages:     Message[]
```

**Domain Methods:**
- `Conversation.create(params)` — validates participant types match conversation type; emits `ConversationCreatedEvent`
- `conversation.close()` — admin can close a conversation
- `conversation.reopen()` — reopen a closed conversation

---

### 4. Message (Entity)

A single message within a conversation.

```
Message
  id:             UUID
  conversationId: UUID
  senderId:       UUID (userId)
  content:        string
  attachmentUrl:  string? (optional file attachment)
  status:         sent | delivered | read
  sentAt:         DateTime
  deliveredAt:    DateTime?
  readAt:         DateTime?
```

---

### 5. DeviceToken (Entity)

FCM device token for push notification delivery. One user can have multiple device tokens (multiple devices).

```
DeviceToken
  id:        UUID
  userId:    UUID
  token:     string (FCM registration token)
  platform:  ios | android
  isActive:  boolean
  createdAt: DateTime
  updatedAt: DateTime
```

---

## Notification Delivery Flow

```
Domain Event fires (e.g. LessonReportSubmittedEvent)
  |
Outbox -> BullMQ notification-events queue
  |
NotificationWorker processes job:
  1. Determine recipients (e.g. parent of student)
  2. Create Notification record(s) in DB
  3. Attempt WebSocket delivery:
       SocketIoService.to("user:{userId}").emit("notification", payload)
  4. Attempt FCM push (if user has active DeviceTokens + missed WS):
       FCMService.sendToTokens(tokens, { title, body, data })
  5. Send email if notification type requires it:
       EmailService.send({ template, to, data })
  6. Mark notification as delivered
```

---

## Push Notification Strategy

- FCM used for both iOS and Android via Firebase Admin SDK
- A user can have multiple active device tokens (e.g. phone + tablet)
- Stale/invalid tokens are automatically removed when FCM returns an `UNREGISTERED` error
- Critical notifications (lesson cancellation, payment failure) are sent via all channels (in-app + push + email)
- Informational notifications (lesson reminder) use push + in-app only

---

## Email Templates

| Template | Trigger | Recipient |
|---|---|---|
| `email-verification` | AuthAccountCreatedEvent | Parent (new account) |
| `otp-login` | ResendOtpCommand | Parent |
| `lesson-scheduled` | LessonScheduledEvent | Parent |
| `lesson-reminder-24h` | Cron 24h before lesson | Parent + Student |
| `lesson-cancelled` | LessonCancelledEvent | Parent + Student |
| `lesson-report-ready` | LessonReportSubmittedEvent | Parent |
| `teacher-application-received` | TeacherApplicationReceivedEvent | OrgAdmin |
| `teacher-application-result` | TeacherApplicationApprovedEvent / RejectedEvent | Teacher applicant |
| `org-invitation` | OrgInvitationSentEvent | Invitee email |
| `new-message` | MessageSentEvent | Recipient (if not online) |
| `payment-failed` | SubscriptionPaymentFailedEvent | Parent |

---

## Domain Events

| Event | Emitted By | Payload | Trigger |
|---|---|---|---|
| `ConversationCreatedEvent` | Conversation.create | conversationId, participants | notification-events |
| `MessageSentEvent` | (WebSocket handler) | messageId, conversationId, senderId | notification-events (push/email if offline) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| Parent can ONLY message org admins — not teachers | `Conversation.create()` validates type=parent_admin; participants must include one admin OrgMembership |
| Students can message their primary teacher directly | `Conversation.create()` validates type=student_teacher; teacher must be student's classroom teacher |
| A conversation between a student and teacher is unique per classroom (no duplicate threads) | Unique constraint on `(type, studentId, teacherId, classroomId)` |
| A parent-admin conversation is unique per org per parent | Unique constraint on `(orgId, parentId, type)` |
| FCM tokens must be registered per device; old tokens are invalidated when a user logs out a device | `session.revoke()` triggers FCM token deactivation for that session's deviceId |
| Notifications older than 90 days are soft-deleted from the DB | Background cron cleanup |
| Unread notification count is cached in Redis per user | Invalidated on `notification.markRead()` and on new notification creation |

---

## Business Actions

### Notifications

| Action | Actor | Description |
|---|---|---|
| Register device token | Any user | Save FCM token for push delivery |
| Mark notification read | Recipient | Mark single notification as read |
| Mark all read | Recipient | Batch mark all unread as read |
| List notifications | Recipient | Paginated list of in-app notifications |
| Get unread count | Recipient | Cached Redis count for notification badge |

### Messaging

| Action | Actor | Description |
|---|---|---|
| Create student-teacher conversation | Student | Initiates a question thread to their classroom teacher |
| Create parent-admin conversation | Parent | Initiates a conversation with org admin |
| Send message | Participant | Sends text message (+ optional attachment) |
| View conversation history | Participant | Paginated message history |
| Mark messages read | Participant | Marks all unread messages as read |
| Close conversation | Admin | Closes a parent-admin conversation |
| Reopen conversation | Admin | Reopens closed conversation |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| Notification | `INotificationRepository` | Global (per user) |
| Conversation | `IConversationRepository` | Org-scoped |
| Message | `IMessageRepository` | Org-scoped |
| DeviceToken | `IDeviceTokenRepository` | Global (per user) |

---

## Prisma Schema (To Add)

```prisma
// notification.prisma

model Notification {
  id          String   @id @db.Uuid
  recipientId String   @db.Uuid
  type        NotificationType
  title       String
  body        String
  data        Json
  channel     NotificationChannel
  status      NotificationStatus @default(unread)
  deliveredAt DateTime?
  readAt      DateTime?
  createdAt   DateTime @default(now())
}

enum NotificationStatus { unread read }
enum NotificationChannel { in_app push email all }

model DeviceToken {
  id        String   @id @db.Uuid
  userId    String   @db.Uuid
  token     String
  platform  DevicePlatform
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, token])
}

enum DevicePlatform { ios android }

// messaging.prisma

model Conversation {
  id            String   @id @db.Uuid
  orgId         String   @db.Uuid
  type          ConversationType
  participants  String[]
  studentId     String?  @db.Uuid
  parentId      String?  @db.Uuid
  subject       String?
  status        ConversationStatus @default(active)
  lastMessageAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  messages      Message[]
}

enum ConversationType { student_teacher parent_admin }
enum ConversationStatus { active closed }

model Message {
  id             String   @id @db.Uuid
  conversationId String   @db.Uuid
  senderId       String   @db.Uuid
  content        String
  attachmentUrl  String?
  status         MessageStatus @default(sent)
  sentAt         DateTime
  deliveredAt    DateTime?
  readAt         DateTime?

  conversation   Conversation @relation(fields: [conversationId], references: [id])
}

enum MessageStatus { sent delivered read }
```

---

## WebSocket Events (Notifications & Chat Module)

### `/notifications` Namespace

| Event | Direction | Payload | Description |
|---|---|---|---|
| `notification:new` | Server -> user:{userId} | { notification } | New notification delivered |
| `notification:mark_read` | Client -> Server | { notificationId } | Mark single notification read |
| `notification:mark_all_read` | Client -> Server | {} | Mark all unread read |
| `notification:count` | Server -> user:{userId} | { unreadCount } | Updated unread count |

### `/chat` Namespace

| Event | Direction | Payload | Description |
|---|---|---|---|
| `chat:join` | Client -> Server | { conversationId } | Join conversation room |
| `chat:message` | Client -> Server | { conversationId, content, attachmentUrl? } | Send message |
| `chat:message:new` | Server -> Room | { message } | New message delivered to participants |
| `chat:message:delivered` | Server -> Sender | { messageId } | Delivery confirmation |
| `chat:message:read` | Server -> Room | { messageId, readBy } | Read receipt |
| `chat:typing` | Client -> Server | { conversationId, isTyping } | Typing indicator |
| `chat:typing:broadcast` | Server -> Room | { userId, isTyping } | Broadcast typing indicator |

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /notifications | Any auth | List in-app notifications (paginated) |
| GET | /notifications/count | Any auth | Get unread notification count |
| POST | /notifications/mark-read | Any auth | Mark single or all notifications read |
| POST | /devices/tokens | Any auth | Register FCM device token |
| DELETE | /devices/tokens/:token | Any auth | Remove FCM device token (on logout) |
| GET | /conversations | Any auth | List conversations for current user |
| POST | /conversations | Student/Parent | Start new conversation |
| GET | /conversations/:id | Participant | Get conversation detail + messages |
| POST | /conversations/:id/messages | Participant | Send message |
| POST | /conversations/:id/close | Admin | Close conversation |
| POST | /conversations/:id/reopen | Admin | Reopen conversation |
