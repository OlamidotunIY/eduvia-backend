import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteUserOnboardingCommand } from './complete-user-onboarding.command';
import { CompleteUserOnboardingResult } from './complete-user-onboarding.result';
import { IUserRepository } from '../../../domain/repository';
import {
  IParentProfileRepository,
  ITeacherProfileRepository,
  ParentProfile,
  ParentProfileId,
  TeacherProfile,
  UserId,
  UserType,
} from '../../../domain';

@CommandHandler(CompleteUserOnboardingCommand)
export class CompleteUserOnboardingHandler implements ICommandHandler<CompleteUserOnboardingCommand, CompleteUserOnboardingResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly parentProfileRepository: IParentProfileRepository,
    private readonly teacherProfileRepository: ITeacherProfileRepository,
  ) {}

  async execute(command: CompleteUserOnboardingCommand): Promise<CompleteUserOnboardingResult> {
    const { payload } = command;

    const user = await this.userRepository.findById(UserId.from(payload.userId));
    if (!user) throw new Error('User not found');
    user.completeOnboarding(payload);
    await this.userRepository.save(user);

    if (payload.userType === UserType.PARENT) {
      const userId = UserId.from(user.getId());
      const existing = await this.parentProfileRepository.findByUserId(userId);
      if (!existing) await this.parentProfileRepository.save(ParentProfile.create({ id: ParentProfileId.create(), userId }));
    }
    if (payload.userType === UserType.TEACHER) {
      const userId = UserId.from(user.getId());
      const existing = await this.teacherProfileRepository.findByUserId(userId);
      if (!existing) await this.teacherProfileRepository.save(TeacherProfile.create({ userId, qualification: '', yearOfExperience: 0 }));
    }

    return {
      id: user.getId(),
      nextStep:
        payload.userType === UserType.TEACHER
          ? 'teacher_organization_choice'
          : 'parent_dashboard',
    };
  }
}
