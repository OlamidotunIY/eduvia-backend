import { ConversationType } from '../../domain';

export class CreateConversationDto {
  orgId: string;
  type: ConversationType;
  participants: string[];
  studentId?: string | null;
  parentId?: string | null;
  subject?: string | null;
}
