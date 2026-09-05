import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { DomainExceptionFilter } from './modules/shared/infrastructure/http/filters/domain-exception.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
   app.useGlobalFilters(
    new DomainExceptionFilter(),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
