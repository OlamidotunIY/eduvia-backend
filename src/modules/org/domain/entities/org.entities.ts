import { AggregateRoot } from '@modules/shared';
import { OrganizationId, OrganizationStatus, OrganizationSubjectId } from '../value-objects';
import { OrganizationCreatedEvent } from '../events/org-created-event';
import { OrganizationApprovedEvent } from '../events/org-approved-event';
import {
  OrganizationAlreadySuspendedError,
  OrganizationNotActiveError,
} from '../errors';
import { OrganizationSuspendedEvent } from '../events/org-suspended-event';
import { OrganizationUpdatedEvent } from '../events/org-updated-event';
import { OrganizationPolicy } from './org.policy.entity';

class Organization extends AggregateRoot<OrganizationId> {
  public readonly ownerId: string;
  private _name: string;
  private _slug: string;
  private _description: string | null;
  private _logoUrl: string | null;
  private _websiteUrl: string | null;
  private _contactEmail: string;
  private _contactPhone: string | null;
  private _country: string;
  private _timezone: string;
  private _status: OrganizationStatus;
  private _marketplaceListed: boolean;
  private _acceptingTeachers: boolean;
  private _acceptingTeachersFor: OrganizationSubjectId[];
  private _policy: OrganizationPolicy;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  /* subjects:          OrgSubject[]
  memberships:       OrgMembership[]
  policies:          OrgPolicy (embedded)
  subscriptionPlans: SubscriptionPlan[] */

  private constructor(params: {
    id: OrganizationId;
    ownerId: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    contactEmail: string;
    contactPhone: string | null;
    country: string;
    timezone: string;
    status: OrganizationStatus;
    marketplaceListed: boolean;
    acceptingTeachers: boolean;
    acceptingTeachersFor: OrganizationSubjectId[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);

    this.ownerId = params.ownerId;
    this._name = params.name;
    this._slug = params.slug;
    this._description = params.description;
    this._logoUrl = params.logoUrl;
    this._websiteUrl = params.websiteUrl;
    this._contactEmail = params.contactEmail;
    this._contactPhone = params.contactPhone;
    this._country = params.country;
    this._timezone = params.timezone;
    this._status = params.status;
    this._marketplaceListed = params.marketplaceListed;
    this. _acceptingTeachers = params.acceptingTeachers;
    this._acceptingTeachersFor = params.acceptingTeachersFor;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    ownerId: string;
    name: string;
    slug: string;
    contactEmail: string;
    country:string;
    timezone: string;
    correlationId: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
  }): Organization {
    const now = new Date();

    const organization = new Organization({
      id: OrganizationId.create(),
      ownerId: params.ownerId,
      name: params.name,
      slug: params.slug,
      description: null,
      logoUrl: params.logoUrl ?? null,
      websiteUrl:  params.websiteUrl ?? null,
      contactEmail: params.contactEmail,
      contactPhone: null,
      country: params.country,
      timezone: params.timezone,
      status: OrganizationStatus.ACTIVE,
      marketplaceListed: false,
      acceptingTeachers: false,
      acceptingTeachersFor: [],
      createdAt: now,
      updatedAt: now,
    });

    organization.addDomainEvent(
      new OrganizationCreatedEvent(
        organization.getId(),
        new OrganizationCreatedEvent.Payload(
          organization.getId(),
          organization.ownerId,
          params.name,
          params.slug,
          params.contactEmail
        ),
        params.correlationId,
      ),
    );
    return organization;
  }

  public static reconstitute(params: {
    id: OrganizationId;
    ownerId: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    contactEmail: string;
    contactPhone: string | null;
    country: string;
    timezone: string;
    status: OrganizationStatus;
    marketplaceListed: boolean;
    acceptingTeachers: boolean;
    acceptingTeachersFor :OrganizationSubjectId[];
    createdAt: Date;
    updatedAt: Date;
  }): Organization {
    return new Organization(params);
  }

  public updateProfile(params: {
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string;
  contactPhone?: string | null;
  country?: string;
  timezone?: string;
  correlationId: string;
}): void {
  const changedFields: Record<string, unknown> = {};

  if (params.name !== undefined) {
    this._name = params.name;
    changedFields.name = params.name;
  }

  if (params.description !== undefined) {
    this._description = params.description;
    changedFields.description = params.description;
  }

  if (params.logoUrl !== undefined) {
    this._logoUrl = params.logoUrl;
    changedFields.logoUrl = params.logoUrl;
  }

  if (params.websiteUrl !== undefined) {
    this._websiteUrl = params.websiteUrl;
    changedFields.websiteUrl = params.websiteUrl;
  }

  if (params.contactEmail !== undefined) {
    this._contactEmail = params.contactEmail;
    changedFields.contactEmail = params.contactEmail;
  }

  if (params.contactPhone !== undefined) {
    this._contactPhone = params.contactPhone;
    changedFields.contactPhone = params.contactPhone;
  }

  if (params.country !== undefined) {
    this._country = params.country;
    changedFields.country = params.country;
  }

  if (params.timezone !== undefined) {
    this._timezone = params.timezone;
    changedFields.timezone = params.timezone;
  }

  this._updatedAt = new Date();

  this.addDomainEvent(
    new OrganizationUpdatedEvent(
      this.getId(),
      new OrganizationUpdatedEvent.Payload(this.getId(), changedFields),
      params.correlationId,
    ),
  );
}

  public approve(correlationId: string): void {
    this._status = OrganizationStatus.ACTIVE;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new OrganizationApprovedEvent(
        this.getId(),
        new OrganizationApprovedEvent.Payload(this.getId(), this.ownerId),
        correlationId,
      ),
    );
  }

  public suspend(correlationId: string): void {
    if (this._status === OrganizationStatus.SUSPENDED) {
      throw new OrganizationAlreadySuspendedError();
    }

    this._status = OrganizationStatus.SUSPENDED;

    this._marketplaceListed = false;
    this._acceptingTeachersFor = [];
    this._updatedAt = new Date();

    this.addDomainEvent(
      new OrganizationSuspendedEvent(
        this.getId(),
        new OrganizationSuspendedEvent.Payload(this.getId(), this.ownerId),
        correlationId,
      ),
    );
  }

  public listOnMarketPlace(): void {
    if (this._status !== OrganizationStatus.ACTIVE) {
      throw new OrganizationNotActiveError(
        'Only active organizations can be listed on marketplace',
      );
    }

    this._marketplaceListed = true;
    this._updatedAt = new Date();
  }

  public delistFromMarket(): void {
    this._marketplaceListed = false;
    this._updatedAt = new Date();
  }

  public openForTeacherApplication(): void {
    if (this._status !== OrganizationStatus.ACTIVE) {
      throw new OrganizationNotActiveError(
        'Only active organizations can accept teacher applications',
      );
    }
    this._acceptingTeachers = true;
    this._updatedAt = new Date();
  }

  public closeTeacherApplications(): void {
    this._acceptingTeachers = false;
    this._updatedAt = new Date();
  }

  public get name(): string{
    return this._name
  }

  public get slug(): string{
    return this._slug
  }

  public get description(): string | null {
    return this._description
  }

  public get logoUrl(): string | null {
    return this._logoUrl;
  }

  public get websiteUrl(): string | null {
    return this._websiteUrl;
  }

  public get contactEmail(): string {
    return this._contactEmail;
  }

  public get contactPhone(): string | null {
    return this._contactPhone;
  }

  public get country(): string {
    return this._country;
  }

  public get timezone(): string {
    return this._timezone;
  }

  public get status(): OrganizationStatus {
    return this._status;
  }

  public get marketplaceListed(): boolean {
    return this._marketplaceListed;
  }

  public get acceptingTeachers(): boolean {
    return this._acceptingTeachers;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isActive(): boolean {
    return this._status === OrganizationStatus.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._status === OrganizationStatus.SUSPENDED;
  }
}

export { Organization }
