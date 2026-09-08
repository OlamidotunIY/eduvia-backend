import { Query } from "@nestjs/cqrs";
import { GetVerificationPayload, VerificationDTO } from "./get-verification.query.payload";

export class GetVerificationQuery extends Query<VerificationDTO>{
    constructor(
        public readonly payload: GetVerificationPayload
    ){
        super()
    }
}