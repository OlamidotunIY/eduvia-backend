import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlatformAdminByUserIdQuery } from './get-platform-admin-by-user-id.query';
import { IPlatformAdminRepository } from '../../../domain';
import { PlatformAdminDto } from '../dto/platform-admin.dto';

@QueryHandler(GetPlatformAdminByUserIdQuery)
export class GetPlatformAdminByUserIdHandler
  implements IQueryHandler<GetPlatformAdminByUserIdQuery, PlatformAdminDto | null>
{
  constructor(private readonly adminRepository: IPlatformAdminRepository) {}

  async execute(
    query: GetPlatformAdminByUserIdQuery,
  ): Promise<PlatformAdminDto | null> {
    const admin = await this.adminRepository.findByUserId(query.userId);
    if (!admin) {
      return null;
    }
    return {
      id: admin.id.toString(),
      userId: admin.userId,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
