import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByEmailQuery } from "./get-user-by-email.query";
import { IUserRepository } from "../../../domain/repository/user.repository";
import { UserDTO } from "../get-user-by-id/get-user-by-id.query.payload";

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery>
{
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(query: GetUserByEmailQuery): Promise<UserDTO> {
        const { payload } = query;

        const user = await this.userRepository.getUserByEmail(
            payload.email,
        );

        if (!user) {
            throw new Error("User not found");
        }

        return {
            id: user.getId(),
            userType: user.userType,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
