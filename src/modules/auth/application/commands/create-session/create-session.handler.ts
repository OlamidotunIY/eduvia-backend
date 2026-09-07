import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateSessionCommand } from "./create-session.command";
import { ISessionRepository } from "../../../domain/repository/session.repository";
import { Session } from "../../../domain/model/Session";


@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
    implements ICommandHandler<CreateSessionCommand>
{
    constructor(
        private readonly sessionRepository: ISessionRepository,
    ) {}

    async execute(
        command: CreateSessionCommand,
    ): Promise<void> {
        const { payload } = command;

        const session = Session.create({
            id: payload.id,
            authAccountId: payload.authAccountId,
            userId: payload.userId,
            userType: payload.userType,
            refreshTokenHash: payload.refreshTokenHash,
            accessTokenExpiresAt: payload.accessTokenExpiresAt,
            refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
            ipAddress: payload.ipAddress,
            userAgent: payload.userAgent,
            correlationId: payload.correlationId,
        });

        await this.sessionRepository.save(session);
    }
}