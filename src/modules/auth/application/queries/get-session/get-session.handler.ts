import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetSessionQuery } from "./get-session.query";
import { SessionDTO } from "./get-session.query.payload";
import { ISessionRepository } from "../../../domain";

@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(query: GetSessionQuery): Promise<SessionDTO> {
    const { payload } = query;

    const session = await this.sessionRepository.findById(payload.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    return {
      id: session.getId(),
      userId: session.userId,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
