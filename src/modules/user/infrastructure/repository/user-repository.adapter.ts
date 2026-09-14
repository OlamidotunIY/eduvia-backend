import { IUserRepository } from '../../domain';
import { User } from '../../domain/entities';

export class UserRepositoryAdapter implements IUserRepository {
  public async getUserByEmail(email: string): Promise<User | null> {}
}
