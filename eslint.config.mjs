import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'
// import parserTs from '@typescript-eslint/parser'

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    pluginName: '@stylistic/ts',
    indent: 2,
    quotes: 'single',
    semi: false,
  }),
  {
    rules: {
      '@stylistic/ts/indent': ['error', 2, {
        flatTernaryExpressions: true,
        SwitchCase: 1,
      }],
    },
  },
  { ignores: ['main.js'] },
]
