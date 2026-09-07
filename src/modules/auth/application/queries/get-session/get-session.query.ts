import { Query } from "@nestjs/cqrs";
import { GetSessionPayload, SessionDTO } from "./get-session.query.payload";

export class GetSessionQuery extends Query<SessionDTO | null> {
    constructor(
        public readonly payload: GetSessionPayload,
    ) {
        super();
    }
}