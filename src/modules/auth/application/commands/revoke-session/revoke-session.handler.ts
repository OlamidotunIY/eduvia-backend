import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RevokeSessionCommand } from "./revoke-session.command";
import { ISessionRepository } from "../../../domain/repository/session.repository";

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler implements ICommandHandler<RevokeSessionCommand>{
    constructor(
        private readonly sessionRepository: ISessionRepository
    ){}

    async execute(command: RevokeSessionCommand): Promise<void> {
        const { payload } = command;

        const session = await this.sessionRepository.findById(payload.sessionId)

        if(!session){
            throw new Error("Session not found")
        }

        session.revoke

        await this.sessionRepository.save(session);
    }
}