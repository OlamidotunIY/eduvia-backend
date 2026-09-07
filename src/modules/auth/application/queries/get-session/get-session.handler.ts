import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetSessionQuery } from "./get-session.query";
import { SessionDTO } from "./get-session.query.payload";
import { ISessionRepository } from "../../../domain/repository/session.repository";

@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(query: GetSessionQuery): Promise<SessionDTO | null> {
    const { payload } = query;

    const session = await this.sessionRepository.findById(payload.sessionId);

    if (!session) {
      return null;
    }

    return {
      id: session.getId(),
      authAccountId: session.authAccountId,
      userId: session.userId,
      userType: session.userType,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      sessionStatus: session.sessionStatus,
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
