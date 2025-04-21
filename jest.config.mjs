import { createDefaultPreset } from 'ts-jest'

const typescriptJestPreset = createDefaultPreset()

/** @type { import("ts-jest").JestConfigWithTsJest } */
const config = {
  ...typescriptJestPreset,

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: process.env.CI
    ? ['text', 'json', 'clover', 'cobertura']
    : ['text', 'html'],

  testMatch: [
    '**/__test__/**/*.test.ts',
  ],

  cacheDirectory: 'node_modules/.cache/jest',
  verbose: true,
}

export default config
