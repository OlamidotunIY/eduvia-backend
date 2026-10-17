const noopDecorator = (target, key, descriptor) => descriptor || target;

class CommandBus {
  execute() {
    return Promise.resolve();
  }
}

class QueryBus {
  execute() {
    return Promise.resolve();
  }
}

class EventBus {
  publish() {
    return Promise.resolve();
  }
}

class CqrsModule {
  static forRoot() {
    return { module: CqrsModule };
  }
}

module.exports = {
  CommandHandler: () => noopDecorator,
  QueryHandler: () => noopDecorator,
  EventsHandler: () => noopDecorator,
  CommandBus,
  QueryBus,
  EventBus,
  CqrsModule,
};
