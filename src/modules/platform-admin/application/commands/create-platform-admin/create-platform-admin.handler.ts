import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePlatformAdminCommand } from './create-platform-admin.command';
import {
  IPlatformAdminRepository,
  PlatformAdmin,
  PlatformAdminAlreadyExistsError,
  UnauthorizedPlatformActionError,
} from '../../../domain';

export interface CreatePlatformAdminResult {
  id: string;
  userId: string;
  role: string;
}

@CommandHandler(CreatePlatformAdminCommand)
export class CreatePlatformAdminHandler
  implements ICommandHandler<CreatePlatformAdminCommand, CreatePlatformAdminResult>
{
  constructor(private readonly adminRepository: IPlatformAdminRepository) {}

  async execute(command: CreatePlatformAdminCommand): Promise<CreatePlatformAdminResult> {
    const caller = await this.adminRepository.findByUserId(command.callerUserId);
    if (!caller || !caller.isSuperAdmin()) {
      throw new UnauthorizedPlatformActionError(
        'Only platform super admins can create platform admin accounts.',
      );
    }

    const existing = await this.adminRepository.findByUserId(command.userId);
    if (existing) {
      throw new PlatformAdminAlreadyExistsError(command.userId);
    }

    const admin = PlatformAdmin.create({
      userId: command.userId,
      role: command.role,
    });

    await this.adminRepository.save(admin);

    return {
      id: admin.id.toString(),
      userId: admin.userId,
      role: admin.role,
    };
  }
}
