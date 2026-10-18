import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import {
  LessonGateway,
  BoardGateway,
  NotificationsGateway,
  ChatGateway,
} from './gateways';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsExceptionFilter } from './filters/ws-exception.filter';

@Global()
@Module({
  imports: [JwtModule, ConfigModule],
  providers: [
    LessonGateway,
    BoardGateway,
    NotificationsGateway,
    ChatGateway,
    WsJwtGuard,
    WsExceptionFilter,
  ],
  exports: [
    LessonGateway,
    BoardGateway,
    NotificationsGateway,
    ChatGateway,
    WsJwtGuard,
  ],
})
export class WebSocketModule {}
