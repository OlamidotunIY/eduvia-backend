export interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export abstract class IEmailNotificationPort {
  public abstract sendEmail(params: SendEmailParams): Promise<void>;
}
