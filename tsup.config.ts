import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: './src/main.ts',
    styles: './src/styles/index.css',
  },
  outDir: '.',
  splitting: false,
  sourcemap: true,
  clean: false,
  external: ['obsidian', '@codemirror/view', '@codemirror/state'],
})
