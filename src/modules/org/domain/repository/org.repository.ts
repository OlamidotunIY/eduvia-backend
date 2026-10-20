import { BaseRepository } from "@modules/shared";
import { OrganizationId } from "../value-objects";
import { Organization } from "../model/Organization";

export abstract class IOrganizationRepository extends BaseRepository<Organization, OrganizationId>{
    public abstract findBySlug(slug: string): Promise<Organization | null>;
    abstract findByOwnerId(ownerId: string): Promise<Organization[]>;
}