import { Command } from "@nestjs/cqrs";
import { RegisterStudentPayload, RegisterStudentResult } from "./register-student.result";

export class RegisterStudentCommand extends Command<RegisterStudentResult>{
    constructor(
        public readonly payload: RegisterStudentPayload
    ){
        super()
    }
}