import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "./get-user-by-id.query";
import { IUserRepository } from "../../../domain/repository/user.repository";
import { UserDTO } from "./get-user-by-id.query.payload";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery>
{
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(query: GetUserByIdQuery): Promise<UserDTO> {
        const { payload } = query;

        const user = await this.userRepository.findById(
            payload.userId,
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