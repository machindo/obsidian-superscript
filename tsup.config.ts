import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: '.',
  splitting: false,
  sourcemap: true,
  clean: false,
  external: ['obsidian']
})