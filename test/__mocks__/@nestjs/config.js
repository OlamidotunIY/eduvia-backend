class ConfigService {
  constructor(internalConfig = {}) {
    this.internalConfig = internalConfig;
  }

  get(key) {
    return this.internalConfig[key] ?? process.env[key] ?? null;
  }

  getOrThrow(key) {
    const val = this.get(key);
    if (val === null || val === undefined) {
      throw new Error(`Config key "${key}" does not exist`);
    }
    return val;
  }
}

module.exports = {
  ConfigService,
  ConfigModule: {
    forRoot: () => ({ module: class ConfigModule {} }),
  },
};
