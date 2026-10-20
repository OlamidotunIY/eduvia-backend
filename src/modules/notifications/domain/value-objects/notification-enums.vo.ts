export enum NotificationType {
  // Lesson events
  lesson_scheduled = 'lesson_scheduled',
  lesson_reminder_24h = 'lesson_reminder_24h',
  lesson_reminder_1h = 'lesson_reminder_1h',
  lesson_started = 'lesson_started',
  lesson_cancelled = 'lesson_cancelled',
  lesson_rescheduled = 'lesson_rescheduled',
  lesson_no_show = 'lesson_no_show',

  // Assessment + reports
  report_submitted = 'report_submitted',
  report_ai_draft_ready = 'report_ai_draft_ready',
  marking_pending = 'marking_pending',

  // Org events
  teacher_application_received = 'teacher_application_received',
  teacher_application_result = 'teacher_application_result',
  org_invitation_sent = 'org_invitation_sent',
  org_approved = 'org_approved',

  // Billing
  subscription_created = 'subscription_created',
  subscription_renewed = 'subscription_renewed',
  subscription_payment_failed = 'subscription_payment_failed',
  subscription_cancelled = 'subscription_cancelled',

  // Messages
  new_message = 'new_message',

  // System
  account_verification = 'account_verification',
  password_reset = 'password_reset',
}

export enum NotificationChannel {
  in_app = 'in_app',
  push = 'push',
  email = 'email',
  all = 'all',
}

export enum NotificationStatus {
  unread = 'unread',
  read = 'read',
}

export enum DevicePlatform {
  ios = 'ios',
  android = 'android',
}

export enum ConversationType {
  student_teacher = 'student_teacher',
  parent_admin = 'parent_admin',
}

export enum ConversationStatus {
  active = 'active',
  closed = 'closed',
}

export enum MessageStatus {
  sent = 'sent',
  delivered = 'delivered',
  read = 'read',
}
