import { Query } from "@nestjs/cqrs";
import { GetVerificationPayload, VerificationDTO } from "./get-verification.query.payload";

export class GetVerificationQuery extends Query<VerificationDTO | null>{
    constructor(
        public readonly payload: GetVerificationPayload
    ){
        super()
    }
}