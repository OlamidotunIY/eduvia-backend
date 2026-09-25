import { AggregateRoot } from '@modules/shared';
import { OrganizationInvitationId } from '../value-objects';
import { InvitationRole } from '../value-objects/org-invitation.role.v0';
import { InvitationStatus } from '../value-objects/org-invitation-status.v0';
import { OrganizationInvitationSentEvent } from '../events/org-invitation-sent.event';
import { OrganizationInvitationAcceptedEvent } from '../events/org-invitation-accepted.event';


class OrganizationInvitation extends AggregateRoot<OrganizationInvitationId> {
  public readonly orgId: string;
  public readonly inviterUserId: string;
  public readonly inviteeEmail: string;
  public readonly role: InvitationRole;
  public readonly subjects: string[];
  private readonly _tokenHash: string;
  private _status: InvitationStatus;
  public readonly expiresAt: Date;
  private _acceptedAt: Date | null;
  public readonly createdAt: Date;

  private constructor(params: {
    id: OrganizationInvitationId;
    orgId: string;
    inviterUserId: string;
    inviteeEmail: string;
    role: InvitationRole;
    subjects: string[];
    tokenHash: string;
    status: InvitationStatus;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
  }) {
    super(params.id);

    this.orgId = params.orgId;
    this.inviterUserId = params.inviterUserId;
    this.inviteeEmail = params.inviteeEmail;
    this.role = params.role;
    this.subjects = params.subjects;
    this._tokenHash = params.tokenHash;
    this._status = params.status;
    this.expiresAt = params.expiresAt;
    this._acceptedAt = params.acceptedAt;
    this.createdAt = params.createdAt;
  }

  public static create(params: {
    orgId: string;
    inviterUserId: string;
    inviteeEmail: string;
    role: InvitationRole;
    subjects?: string[];
    tokenHash: string;
    rawToken: string;
    expiresInHours: number;
    correlationId: string;
  }): OrganizationInvitation {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.expiresInHours * 60 * 60 * 1000);

    const invitation = new OrganizationInvitation({
      id: OrganizationInvitationId.create(),
      orgId: params.orgId,
      inviterUserId: params.inviterUserId,
      inviteeEmail: params.inviteeEmail,
      role: params.role,
      subjects: params.subjects ?? [],
      tokenHash: params.tokenHash,
      status: InvitationStatus.PENDING,
      expiresAt,
      acceptedAt: null,
      createdAt: now,
    });

    invitation.addDomainEvent(
      new OrganizationInvitationSentEvent(
        invitation.getId(),
        new OrganizationInvitationSentEvent.Payload(
          invitation.getId(),
          invitation.orgId,
          invitation.inviteeEmail,
          invitation.role,
          params.rawToken,
        ),
        params.correlationId,
      ),
    );

    return invitation;
  }

  public static reconstitute(params: {
    id: OrganizationInvitationId;
    orgId: string;
    inviterUserId: string;
    inviteeEmail: string;
    role: InvitationRole;
    subjects: string[];
    tokenHash: string;
    status: InvitationStatus;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
  }): OrganizationInvitation {
    return new OrganizationInvitation(params);
  }

  public isValid(): boolean {
    return this._status === InvitationStatus.PENDING && this.expiresAt.getTime() > Date.now();
  }

  public accept(acceptedByUserId: string, correlationId: string): void {
    if (this._status !== InvitationStatus.PENDING) {
      throw new Error("Invitation Not Pending");
    }
    if (this.expiresAt.getTime() <= Date.now()) {
      throw new Error("Invitation expired");
    }

    this._status = InvitationStatus.ACCEPTED;
    this._acceptedAt = new Date();

    this.addDomainEvent(
      new OrganizationInvitationAcceptedEvent(
        this.getId(),
        new OrganizationInvitationAcceptedEvent.Payload(
          this.getId(),
          this.orgId,
          acceptedByUserId,
          this.role,
          this.subjects,
        ),
        correlationId,
      ),
    );
  }

  public revoke(): void {
    if (this._status !== InvitationStatus.PENDING) {
      throw new Error("Invitation not pending");
    }

    this._status = InvitationStatus.REVOKED;

  }

  public expire(): void {
    if (this._status !== InvitationStatus.PENDING) {
      return;
    }
    if (this.expiresAt.getTime() > Date.now()) {
      return;
    }

    this._status = InvitationStatus.EXPIRED;

  }

  public matchesTokenHash(tokenHash: string): boolean {
    return this._tokenHash === tokenHash;
  }

  public get status(): InvitationStatus {
    return this._status;
  }

  public get acceptedAt(): Date | null {
    return this._acceptedAt;
  }
}

export { OrganizationInvitation };