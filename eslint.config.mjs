import antfu from '@antfu/eslint-config'
import html from '@html-eslint/eslint-plugin'
import htmlParser from '@html-eslint/parser'

export default antfu(
  {
    stylistic: true,
    formatters: {
      html: true,
    },
    ignores: ['src/posts/**'],
  },
  {
    files: ['**/*.njk'],
    plugins: {
      html,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      ...html.configs.recommended.rules,
      'style/max-statements-per-line': 'off',
      'style/spaced-comment': 'off',
      'html/require-img-alt': 'off',
      'html/no-duplicate-in-head': 'off',
    },
  },
)
