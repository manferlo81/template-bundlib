import { defineConfig } from 'bundlib'

export default defineConfig({
  project: './tsconfig.build.json',
  esModule: true,
  interop: true,
})
