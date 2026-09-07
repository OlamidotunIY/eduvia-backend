import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "../../../domain/repository/user.repository";
import { UpdateUserCommand } from "./update-user.command";
import { UpdateUserResult } from "./update-user.result";

@CommandHandler(UpdateUserCommand) 
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UpdateUserResult>{
    constructor(
        private readonly userRepository: IUserRepository
    ){}

    async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
        const { payload } = command;

        const user = await this.userRepository.findById(payload.userId)
        if(!user){
            throw new Error('User Not Found')
        }

        user.updateProfile({
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            correlationId: payload.correlationId,
        });

        await this.userRepository.save(user);

        return{
            id: user.getId()
        }
    }
}