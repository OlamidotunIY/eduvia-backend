class JwtService {
  constructor(options = {}) {
    this.options = options;
  }

  sign(payload, options) {
    return 'mock-token';
  }

  signAsync(payload, options) {
    return Promise.resolve('mock-token');
  }

  verify(token, options) {
    return { sub: 'mock-user-id', orgId: 'mock-org-id' };
  }

  verifyAsync(token, options) {
    return Promise.resolve({ sub: 'mock-user-id', orgId: 'mock-org-id' });
  }

  decode(token, options) {
    return { sub: 'mock-user-id', orgId: 'mock-org-id' };
  }
}

module.exports = {
  JwtService,
  JwtModule: {
    register: () => ({ module: class JwtModule {} }),
    registerAsync: () => ({ module: class JwtModule {} }),
  },
};
