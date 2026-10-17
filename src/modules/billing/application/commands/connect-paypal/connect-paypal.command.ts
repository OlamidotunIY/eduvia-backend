import { ICommand } from '@nestjs/cqrs';

export class ConnectPayPalCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly merchantId: string,
  ) {}
}
