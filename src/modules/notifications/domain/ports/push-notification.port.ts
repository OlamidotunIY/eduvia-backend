export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PushNotificationResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

export abstract class IPushNotificationPort {
  public abstract sendPushNotification(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<PushNotificationResult>;
}
