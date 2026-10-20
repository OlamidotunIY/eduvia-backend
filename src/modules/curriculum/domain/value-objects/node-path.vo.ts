export class NodePath {
  private readonly _value: string;

  private constructor(value: string) {
    let normalized = value.trim();
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    if (!normalized.endsWith('/')) {
      normalized = normalized + '/';
    }
    this._value = normalized;
  }

  public static root(nodeId: string): NodePath {
    return new NodePath(`/${nodeId}/`);
  }

  public static from(pathString: string): NodePath {
    return new NodePath(pathString);
  }

  public get value(): string {
    return this._value;
  }

  public child(childId: string): NodePath {
    return new NodePath(`${this._value}${childId}/`);
  }

  public ancestorIds(): string[] {
    return this._value
      .split('/')
      .filter((part) => part.length > 0);
  }

  public isAncestorOf(other: NodePath): boolean {
    return other.value.startsWith(this._value) && other.value !== this._value;
  }

  public equals(other: NodePath): boolean {
    if (!other) return false;
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
