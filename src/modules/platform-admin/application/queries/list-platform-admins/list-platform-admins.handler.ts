import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPlatformAdminsQuery } from './list-platform-admins.query';
import { IPlatformAdminRepository } from '../../../domain';
import { PlatformAdminDto } from '../dto/platform-admin.dto';

@QueryHandler(ListPlatformAdminsQuery)
export class ListPlatformAdminsHandler
  implements IQueryHandler<ListPlatformAdminsQuery, PlatformAdminDto[]>
{
  constructor(private readonly adminRepository: IPlatformAdminRepository) {}

  async execute(_query: ListPlatformAdminsQuery): Promise<PlatformAdminDto[]> {
    const admins = await this.adminRepository.findAll();
    return admins.map((admin) => ({
      id: admin.id.toString(),
      userId: admin.userId,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));
  }
}
