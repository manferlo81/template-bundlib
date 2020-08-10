module.exports = {

  testEnvironment: 'node',
  cacheDirectory: 'node_modules/.cache/jest',

  preset: 'ts-jest',

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'json',
    'lcov',
    'clover',
    'text',
    'text-summary',
  ],

  verbose: true,

};
