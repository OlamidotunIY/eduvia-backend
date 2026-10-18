const noopDecorator = (target, key, descriptor) => descriptor || target;

class WorkerHost {
  process(job) {
    return Promise.resolve();
  }
}

module.exports = {
  Processor: () => noopDecorator,
  WorkerHost,
  InjectQueue: () => () => {},
  BullModule: {
    registerQueue: () => ({ module: class BullModule {} }),
    forRoot: () => ({ module: class BullModule {} }),
  },
};
