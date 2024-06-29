import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: './src/main.ts',
    styles: './src/styles/index.css',
  },
  outDir: '.',
  splitting: false,
  sourcemap: true,
  clean: false, // DO NOT CHANGE EVER! This prevents tsup from deleting all files
  external: ['obsidian', '@codemirror/view', '@codemirror/state'],
})
