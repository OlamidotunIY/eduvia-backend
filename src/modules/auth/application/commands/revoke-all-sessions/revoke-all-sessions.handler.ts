import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RevokeAllSessionCommand } from "./rekove-all-sessions.command";
import { ISessionRepository } from "../../../domain/repository/session.repository";

@CommandHandler(RevokeAllSessionCommand)
export class RevokeAllSessionsHandler implements ICommandHandler<RevokeAllSessionCommand>{
    constructor(
        private readonly sessionRepository: ISessionRepository
    ){}

    async execute(command: RevokeAllSessionCommand): Promise<void> {
        const { payload } = command;

        const sessions = await this.sessionRepository.findByUserId(payload.userId);

        for (const session of sessions){
             session.revoke();

            await this.sessionRepository.save(session);
        }
    }
}