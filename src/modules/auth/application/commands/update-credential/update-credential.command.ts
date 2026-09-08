import { Command } from "@nestjs/cqrs";
import { UpdateCredentialsPayload } from "./update-credential.result";

export class UpdateCredentialsCommand extends Command<void> {
  constructor(
    public readonly payload: UpdateCredentialsPayload,
  ) {
    super();
  }
}