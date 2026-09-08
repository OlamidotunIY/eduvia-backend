import { Query } from "@nestjs/cqrs";
import { GetSessionPayload, SessionDTO } from "./get-session.query.payload";

export class GetSessionQuery extends Query<SessionDTO> {
    constructor(
        public readonly payload: GetSessionPayload,
    ) {
        super();
    }
}