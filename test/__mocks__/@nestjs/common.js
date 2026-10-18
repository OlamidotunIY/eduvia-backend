const noopDecorator = (target, key, descriptor) => descriptor || target;

class Logger {
  log() {}
  error() {}
  warn() {}
  debug() {}
  verbose() {}
}

module.exports = {
  Injectable: () => noopDecorator,
  Optional: () => () => {},
  Inject: () => () => {},
  Module: () => noopDecorator,
  Global: () => noopDecorator,
  Controller: () => noopDecorator,
  Get: () => noopDecorator,
  Post: () => noopDecorator,
  Patch: () => noopDecorator,
  Put: () => noopDecorator,
  Delete: () => noopDecorator,
  Query: () => () => {},
  Param: () => () => {},
  Body: () => () => {},
  UseGuards: () => noopDecorator,
  UseFilters: () => noopDecorator,
  UsePipes: () => noopDecorator,
  UseInterceptors: () => noopDecorator,
  Catch: () => noopDecorator,
  SetMetadata: () => noopDecorator,
  createParamDecorator: () => () => {},
  Logger,
};
