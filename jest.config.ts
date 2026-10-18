import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@generated/prisma(.*)$': '<rootDir>/test/__mocks__/prisma.js',
    '^uuid$': '<rootDir>/test/__mocks__/uuid.js',
    '^@nestjs/common$': '<rootDir>/test/__mocks__/@nestjs/common.js',
    '^@nestjs/common/(.*)$': '<rootDir>/test/__mocks__/@nestjs/common.js',
    '^@nestjs/cqrs$': '<rootDir>/test/__mocks__/@nestjs/cqrs.js',
    '^@nestjs/cqrs/(.*)$': '<rootDir>/test/__mocks__/@nestjs/cqrs.js',
    '^@nestjs/config$': '<rootDir>/test/__mocks__/@nestjs/config.js',
    '^@nestjs/config/(.*)$': '<rootDir>/test/__mocks__/@nestjs/config.js',
    '^@nestjs/websockets$': '<rootDir>/test/__mocks__/@nestjs/websockets.js',
    '^@nestjs/websockets/(.*)$': '<rootDir>/test/__mocks__/@nestjs/websockets.js',
    '^@nestjs/jwt$': '<rootDir>/test/__mocks__/@nestjs/jwt.js',
    '^@nestjs/jwt/(.*)$': '<rootDir>/test/__mocks__/@nestjs/jwt.js',
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
