import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist', '.vite', 'node_modules', '*.config.js', '*.config.ts', 'public/tinymce/**']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'dist/**',
      '.vite/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'workers/**/*.js',
      'public/tinymce/**'
    ],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
