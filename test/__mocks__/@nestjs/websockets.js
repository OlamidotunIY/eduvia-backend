const noopDecorator = (target, key, descriptor) => descriptor || target;

class WsException extends Error {
  constructor(error) {
    super(typeof error === 'string' ? error : JSON.stringify(error));
    this.name = 'WsException';
    this.error = error;
  }

  getError() {
    return this.error;
  }
}

class BaseWsExceptionFilter {
  catch(exception, host) {}
}

module.exports = {
  WebSocketGateway: () => noopDecorator,
  WebSocketServer: () => () => {},
  SubscribeMessage: () => noopDecorator,
  MessageBody: () => () => {},
  ConnectedSocket: () => () => {},
  UseGuards: () => noopDecorator,
  UseFilters: () => noopDecorator,
  WsException,
  BaseWsExceptionFilter,
};
