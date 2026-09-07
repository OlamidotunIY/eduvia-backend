import { Query } from "@nestjs/cqrs";
import { AuthAccountDTO, GetAuthAccountPayload } from "./get-auth-account.query.payload";

export class GetAuthAccountQuery extends Query<AuthAccountDTO>{
    constructor(
        public readonly payload: GetAuthAccountPayload
    ){
        super()
    }
}