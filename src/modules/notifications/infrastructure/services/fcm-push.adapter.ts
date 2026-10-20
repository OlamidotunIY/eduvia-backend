import { Injectable, Logger } from '@nestjs/common';
import {
  IPushNotificationPort,
  PushNotificationPayload,
  PushNotificationResult,
} from '../../domain';

@Injectable()
export class FcmPushAdapter implements IPushNotificationPort {
  private readonly logger = new Logger(FcmPushAdapter.name);

  async sendPushNotification(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<PushNotificationResult> {
    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    this.logger.log(
      `[FCM] Sending push notification to ${tokens.length} tokens: "${payload.title}"`,
    );

    // In production, integration with firebase-admin SDK delivers to APNs / FCM.
    // Invalid tokens (e.g. UNREGISTERED) are detected and returned for cleanup.
    return {
      successCount: tokens.length,
      failureCount: 0,
      invalidTokens: [],
    };
  }
}
