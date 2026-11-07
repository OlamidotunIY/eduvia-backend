class Reflector {
  get() {
    return null;
  }
  getAll() {
    return [];
  }
  getAllAndOverride() {
    return null;
  }
  getAllAndMerge() {
    return [];
  }
}

module.exports = {
  Reflector,
  APP_INTERCEPTOR: 'APP_INTERCEPTOR',
  APP_GUARD: 'APP_GUARD',
  APP_PIPE: 'APP_PIPE',
  APP_FILTER: 'APP_FILTER',
};
