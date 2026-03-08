/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@agency/db$': '<rootDir>/../../packages/db/src/index.ts',
    '^@agency/orchestrator$': '<rootDir>/../../packages/orchestrator/src/index.ts',
    '^@agency/events$': '<rootDir>/../../packages/events/src/index.ts',
    '^@agency/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@agency/logger$': '<rootDir>/../../packages/logger/src/index.ts',
    '^@agency/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@agency/agents$': '<rootDir>/../../packages/agents/src/index.ts',
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.(t|j)s', '!**/node_modules/**'],
};
