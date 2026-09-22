import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { CreateUserResult } from './create-user.result';
import { ParentProfile, IParentProfileRepository, UserType, IUserRepository, User, UserId, ParentProfileId } from '../../../domain';
import { IPasswordHashPort } from '@modules/shared';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly parentProfileRepository: IParentProfileRepository,
    private readonly passwordHashPort: IPasswordHashPort,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const { payload } = command;

    if (![UserType.PARENT, UserType.TEACHER].includes(payload.userType)) {
      throw new Error('Only parents and teachers can register');
    }

    const passwordHash = await this.passwordHashPort.hash(payload.passwordRaw);

    const user = User.create({
      id: UserId.create(),
      userType: payload.userType,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      passwordHash,
      timezone: payload.timezone,
      correlationId: payload.correlationId,
    });

    await this.userRepository.save(user);

    if (user.isParent()) {
      await this.parentProfileRepository.save(
        ParentProfile.create({
          id: ParentProfileId.create(),
          userId: user.id,
        }),
      );
    }

    return {
      id: user.getId(),
    };
  }
}
