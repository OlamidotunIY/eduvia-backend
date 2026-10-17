class PrismaClient {
  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
  $transaction(actions) {
    if (typeof actions === 'function') {
      return actions(this);
    }
    return Promise.all(actions);
  }
}

module.exports = {
  PrismaClient,
  OutboxStatus: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },
  Prisma: {},
};
