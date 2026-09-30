import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullMqModule, jwtConstants, OutboxModule } from '@modules/shared';
import { UserModule } from '@modules/user';
import { AuthModule } from '@modules/auth';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorrelationIdInterceptor } from '@modules/shared';
import { OrgModule } from './modules/org/org.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        appKey: config.getOrThrow('OBSERVABLE_API_KEY'),
        appSecret: config.getOrThrow('OBSERVABLE_SECRET_KEY'),
        serviceId: 'eduvia',
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      global: true,
    }),
    BullMqModule,
    OutboxModule,
    UserModule,
    AuthModule,
    OrgModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
  ],
})
export class AppModule {}
