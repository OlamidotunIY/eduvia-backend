import { Query } from "@nestjs/cqrs";
import { GetUserByIdPayload, UserDTO } from "./get-user-by-id.query.payload";

export class GetUserByIdQuery extends Query<UserDTO>{
    constructor(
        public readonly payload: GetUserByIdPayload
    ){
        super()
    }
}