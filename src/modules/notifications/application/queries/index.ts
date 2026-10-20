export * from './dto/notification.dto';
export * from './dto/conversation.dto';
export * from './get-notifications/get-notifications.query';
export * from './get-notifications/get-notifications.handler';
export * from './get-unread-notification-count/get-unread-notification-count.query';
export * from './get-unread-notification-count/get-unread-notification-count.handler';
export * from './get-user-conversations/get-user-conversations.query';
export * from './get-user-conversations/get-user-conversations.handler';
export * from './get-conversation-detail/get-conversation-detail.query';
export * from './get-conversation-detail/get-conversation-detail.handler';

import { GetNotificationsHandler } from './get-notifications/get-notifications.handler';
import { GetUnreadNotificationCountHandler } from './get-unread-notification-count/get-unread-notification-count.handler';
import { GetUserConversationsHandler } from './get-user-conversations/get-user-conversations.handler';
import { GetConversationDetailHandler } from './get-conversation-detail/get-conversation-detail.handler';

export const QueryHandlers = [
  GetNotificationsHandler,
  GetUnreadNotificationCountHandler,
  GetUserConversationsHandler,
  GetConversationDetailHandler,
];
