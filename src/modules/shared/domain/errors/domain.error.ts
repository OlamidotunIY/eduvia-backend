abstract class DomainError extends Error {
  public code: string;
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);

    this.name = new.target.name;
    this.code = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { DomainError };
