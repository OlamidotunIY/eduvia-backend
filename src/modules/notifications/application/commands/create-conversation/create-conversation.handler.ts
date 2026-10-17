import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateConversationCommand } from './create-conversation.command';
import {
  IConversationRepository,
  Conversation,
  ConversationType,
} from '../../../domain';

@CommandHandler(CreateConversationCommand)
export class CreateConversationHandler implements ICommandHandler<CreateConversationCommand, string> {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(command: CreateConversationCommand): Promise<string> {
    if (command.type === ConversationType.student_teacher && command.studentId) {
      const teacherId = command.participants.find((p) => p !== command.studentId);
      if (teacherId) {
        const existing = await this.conversationRepository.findStudentTeacherConversation(
          command.orgId,
          command.studentId,
          teacherId,
        );
        if (existing) {
          return existing.id.toString();
        }
      }
    }

    if (command.type === ConversationType.parent_admin && command.parentId) {
      const existing = await this.conversationRepository.findParentAdminConversation(
        command.orgId,
        command.parentId,
      );
      if (existing) {
        return existing.id.toString();
      }
    }

    const conversation = Conversation.create({
      orgId: command.orgId,
      type: command.type,
      participants: command.participants,
      studentId: command.studentId,
      parentId: command.parentId,
      subject: command.subject,
    });

    await this.conversationRepository.save(conversation);
    return conversation.id.toString();
  }
}
