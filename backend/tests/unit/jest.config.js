/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.service.ts',
    '<rootDir>/src/app/**/repository/*.ts',
    '<rootDir>/src/lib/pagination/*.ts',
    '<rootDir>/src/pkg/utils/*.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
      functions: 75,
      branches: 65,
    },
  },
};
