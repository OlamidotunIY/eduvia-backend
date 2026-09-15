import { Injectable } from '@nestjs/common';
import { IUserLookupPort } from '../../domain/ports/user-lookup.port';
import { PrismaService } from '@modules/shared';

@Injectable()
export class PrismaUserLookupAdapter implements IUserLookupPort {
  constructor(private readonly prisma: PrismaService) {}

  async getUserIdByEmail(email: string): Promise<{ id: number; userType: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, userType: true }
    });

    if (!user) return null;

    return {
      id: user.id,
      userType: user.userType,
    };
  }

  async getUserById(id: number): Promise<{ id: number; userType: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, userType: true }
    });

    if (!user) return null;

    return {
      id: user.id,
      userType: user.userType,
    };
  }
}
