import { OrganizationPolicy } from "../entities/org.policy.entity";


export abstract class IOrgPolicyRepository {
  abstract findByOrgId(orgId: string): Promise<OrganizationPolicy | null>;
  abstract save(policy: OrganizationPolicy): Promise<void>;
}