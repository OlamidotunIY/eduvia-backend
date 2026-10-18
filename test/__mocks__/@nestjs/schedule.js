const noopDecorator = (target, key, descriptor) => descriptor || target;

class SchedulerRegistry {
  addTimeout() {}
  deleteTimeout() {}
  addInterval() {}
  deleteInterval() {}
  addCronJob() {}
  deleteCronJob() {}
}

const CronExpression = {
  EVERY_SECOND: '* * * * * *',
  EVERY_5_SECONDS: '*/5 * * * * *',
  EVERY_10_SECONDS: '*/10 * * * * *',
  EVERY_30_SECONDS: '*/30 * * * * *',
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_10_MINUTES: '*/10 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
};

module.exports = {
  Cron: () => noopDecorator,
  Interval: () => noopDecorator,
  Timeout: () => noopDecorator,
  SchedulerRegistry,
  CronExpression,
  ScheduleModule: {
    forRoot: () => ({ module: class ScheduleModule {} }),
  },
};
