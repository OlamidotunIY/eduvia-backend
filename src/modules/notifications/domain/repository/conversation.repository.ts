import { BaseRepository } from '@modules/shared/domain';
import { ConversationId } from '../value-objects';
import { Conversation } from '../model/Conversation';

export abstract class IConversationRepository extends BaseRepository<Conversation, ConversationId> {
  public abstract findByParticipant(userId: string, orgId?: string): Promise<Conversation[]>;

  public abstract findStudentTeacherConversation(
    orgId: string,
    studentId: string,
    teacherId: string,
  ): Promise<Conversation | null>;

  public abstract findParentAdminConversation(
    orgId: string,
    parentId: string,
  ): Promise<Conversation | null>;
}
