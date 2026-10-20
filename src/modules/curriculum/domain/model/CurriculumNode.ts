import { AggregateRoot } from '@modules/shared';
import { CurriculumNodeId, CurriculumProfileId, NodePath, NodeType } from '../value-objects';
import {
  CurriculumNodeCreatedEvent,
  CurriculumNodeUpdatedEvent,
  CurriculumNodeDeactivatedEvent,
} from '../events';
import { NodeCannotHaveChildrenError, InvalidNodeDepthError } from '../errors';

export interface CurriculumNodeProps {
  id: CurriculumNodeId;
  curriculumId: CurriculumProfileId;
  parentNodeId: CurriculumNodeId | null;
  nodeType: NodeType;
  name: string;
  code?: string | null;
  description?: string | null;
  gradeLevel?: string | null;
  depth: number;
  path: NodePath;
  isLeaf: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CurriculumNode extends AggregateRoot<CurriculumNodeId> {
  private _curriculumId: CurriculumProfileId;
  private _parentNodeId: CurriculumNodeId | null;
  private _nodeType: NodeType;
  private _name: string;
  private _code: string | null;
  private _description: string | null;
  private _gradeLevel: string | null;
  private _depth: number;
  private _path: NodePath;
  private _isLeaf: boolean;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: CurriculumNodeProps) {
    super(props.id);
    this._curriculumId = props.curriculumId;
    this._parentNodeId = props.parentNodeId;
    this._nodeType = props.nodeType;
    this._name = props.name;
    this._code = props.code ?? null;
    this._description = props.description ?? null;
    this._gradeLevel = props.gradeLevel ?? null;
    this._depth = props.depth;
    this._path = props.path;
    this._isLeaf = props.isLeaf;
    this._isActive = props.isActive;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: CurriculumNodeId;
      curriculumId: CurriculumProfileId;
      parentNodeId?: CurriculumNodeId | null;
      parent?: CurriculumNode | null;
      parentPath?: NodePath | string | null;
      parentDepth?: number | null;
      parentIsLeaf?: boolean;
      nodeType: NodeType;
      name: string;
      code?: string | null;
      description?: string | null;
      gradeLevel?: string | null;
      isActive?: boolean;
    },
    correlationId = 'system',
  ): CurriculumNode {
    const nodeId = props.id ?? CurriculumNodeId.create();
    const now = new Date();

    if (!props.name || props.name.trim().length === 0) {
      throw new Error('CurriculumNode name cannot be empty.');
    }

    const isLeaf = props.nodeType === NodeType.learning_objective;

    let parentNodeId: CurriculumNodeId | null = null;
    let depth = 0;
    let path: NodePath;

    if (props.parent) {
      if (props.parent.isLeaf) {
        throw new NodeCannotHaveChildrenError(props.parent.id.value);
      }
      parentNodeId = props.parent.id;
      depth = props.parent.depth + 1;
      path = props.parent.path.child(nodeId.value);
    } else if (props.parentNodeId) {
      if (props.parentIsLeaf) {
        throw new NodeCannotHaveChildrenError(props.parentNodeId.value);
      }
      parentNodeId = props.parentNodeId;
      if (props.parentDepth === undefined || props.parentDepth === null) {
        throw new InvalidNodeDepthError('Parent depth must be provided when parentNodeId is specified.');
      }
      depth = props.parentDepth + 1;

      if (!props.parentPath) {
        throw new InvalidNodeDepthError('Parent path must be provided when parentNodeId is specified.');
      }
      const parentNodePath = typeof props.parentPath === 'string'
        ? NodePath.from(props.parentPath)
        : props.parentPath;
      path = parentNodePath.child(nodeId.value);
    } else {
      parentNodeId = null;
      depth = 0;
      path = NodePath.root(nodeId.value);
    }

    const node = new CurriculumNode({
      id: nodeId,
      curriculumId: props.curriculumId,
      parentNodeId,
      nodeType: props.nodeType,
      name: props.name.trim(),
      code: props.code?.trim() ?? null,
      description: props.description?.trim() ?? null,
      gradeLevel: props.gradeLevel?.trim() ?? null,
      depth,
      path,
      isLeaf,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    node.addDomainEvent(
      new CurriculumNodeCreatedEvent(
        nodeId.value,
        new CurriculumNodeCreatedEvent.Payload(
          nodeId.value,
          props.curriculumId.value,
          parentNodeId ? parentNodeId.value : null,
          props.nodeType,
        ),
        correlationId,
      ),
    );

    return node;
  }

  public static reconstitute(props: CurriculumNodeProps): CurriculumNode {
    return new CurriculumNode(props);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public get curriculumId(): CurriculumProfileId {
    return this._curriculumId;
  }

  public get parentNodeId(): CurriculumNodeId | null {
    return this._parentNodeId;
  }

  public get nodeType(): NodeType {
    return this._nodeType;
  }

  public get name(): string {
    return this._name;
  }

  public get code(): string | null {
    return this._code;
  }

  public get description(): string | null {
    return this._description;
  }

  public get gradeLevel(): string | null {
    return this._gradeLevel;
  }

  public get depth(): number {
    return this._depth;
  }

  public get path(): NodePath {
    return this._path;
  }

  public get isLeaf(): boolean {
    return this._isLeaf;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public update(
    params: {
      name?: string;
      code?: string | null;
      description?: string | null;
      gradeLevel?: string | null;
    },
    correlationId = 'system',
  ): void {
    if (params.name !== undefined) {
      if (!params.name || params.name.trim().length === 0) {
        throw new Error('CurriculumNode name cannot be empty.');
      }
      this._name = params.name.trim();
    }
    if (params.code !== undefined) {
      this._code = params.code?.trim() ?? null;
    }
    if (params.description !== undefined) {
      this._description = params.description?.trim() ?? null;
    }
    if (params.gradeLevel !== undefined) {
      this._gradeLevel = params.gradeLevel?.trim() ?? null;
    }
    this.touch();

    this.addDomainEvent(
      new CurriculumNodeUpdatedEvent(
        this.id.value,
        new CurriculumNodeUpdatedEvent.Payload(this.id.value),
        correlationId,
      ),
    );
  }

  public deactivate(correlationId = 'system'): void {
    this._isActive = false;
    this.touch();

    this.addDomainEvent(
      new CurriculumNodeDeactivatedEvent(
        this.id.value,
        new CurriculumNodeDeactivatedEvent.Payload(this.id.value),
        correlationId,
      ),
    );
  }

  public activate(): void {
    this._isActive = true;
    this.touch();
  }
}
