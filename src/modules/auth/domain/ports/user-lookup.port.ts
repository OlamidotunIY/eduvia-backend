export abstract class IUserLookupPort {
  abstract getUserIdByEmail(email: string): Promise<{ id: number; userType: string } | null>;
  abstract getUserById(id: number): Promise<{ id: number; userType: string } | null>;
}
