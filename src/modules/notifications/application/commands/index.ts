export * from './create-notification/create-notification.command';
export * from './create-notification/create-notification.handler';
export * from './mark-notification-read/mark-notification-read.command';
export * from './mark-notification-read/mark-notification-read.handler';
export * from './mark-all-notifications-read/mark-all-notifications-read.command';
export * from './mark-all-notifications-read/mark-all-notifications-read.handler';
export * from './register-device-token/register-device-token.command';
export * from './register-device-token/register-device-token.handler';
export * from './remove-device-token/remove-device-token.command';
export * from './remove-device-token/remove-device-token.handler';
export * from './create-conversation/create-conversation.command';
export * from './create-conversation/create-conversation.handler';
export * from './send-message/send-message.command';
export * from './send-message/send-message.handler';
export * from './close-conversation/close-conversation.command';
export * from './close-conversation/close-conversation.handler';
export * from './reopen-conversation/reopen-conversation.command';
export * from './reopen-conversation/reopen-conversation.handler';

import { CreateNotificationHandler } from './create-notification/create-notification.handler';
import { MarkNotificationReadHandler } from './mark-notification-read/mark-notification-read.handler';
import { MarkAllNotificationsReadHandler } from './mark-all-notifications-read/mark-all-notifications-read.handler';
import { RegisterDeviceTokenHandler } from './register-device-token/register-device-token.handler';
import { RemoveDeviceTokenHandler } from './remove-device-token/remove-device-token.handler';
import { CreateConversationHandler } from './create-conversation/create-conversation.handler';
import { SendMessageHandler } from './send-message/send-message.handler';
import { CloseConversationHandler } from './close-conversation/close-conversation.handler';
import { ReopenConversationHandler } from './reopen-conversation/reopen-conversation.handler';

export const CommandHandlers = [
  CreateNotificationHandler,
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
  RegisterDeviceTokenHandler,
  RemoveDeviceTokenHandler,
  CreateConversationHandler,
  SendMessageHandler,
  CloseConversationHandler,
  ReopenConversationHandler,
];
