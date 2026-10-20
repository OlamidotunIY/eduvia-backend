import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RevokeAllSessionCommand } from "./rekove-all-sessions.command";
import { ISessionRepository } from "../../../domain";

@CommandHandler(RevokeAllSessionCommand)
export class RevokeAllSessionsHandler implements ICommandHandler<RevokeAllSessionCommand>{
    constructor(
        private readonly sessionRepository: ISessionRepository
    ){}

    async execute(command: RevokeAllSessionCommand): Promise<void> {
        const { payload } = command;

        await this.sessionRepository.deleteByUserId(payload.userId);
    }
}
