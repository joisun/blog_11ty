import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
  },
  {
    ignores: ['src/posts/**'], // 只排除 posts 目录
  },
)
