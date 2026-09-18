import { BaseRepository } from "@modules/shared";
import { OrganizationId } from "../value-objects";
import { Organization } from "../entities/org.entities";

abstract class IOrganizationRepository extends BaseRepository<Organization, OrganizationId>{}