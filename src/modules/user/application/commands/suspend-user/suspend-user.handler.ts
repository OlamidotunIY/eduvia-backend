import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SuspendUserCommand } from "./suspend-user.command";
import { IUserRepository } from "../../../domain/repository/user.repository";

@CommandHandler(SuspendUserCommand)
export class SuspendUserHandler
    implements ICommandHandler<SuspendUserCommand>
{
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(command: SuspendUserCommand): Promise<void> {
        const { payload } = command;

        const user = await this.userRepository.findById(payload.userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.suspend();

        await this.userRepository.save(user);
    }
}