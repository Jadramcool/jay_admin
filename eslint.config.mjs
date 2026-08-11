import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,
  typescript: true,
  ignores: [
    'typings/auto-imports.d.ts',
    'typings/components.d.ts',
    'typings/openapi.d.ts', // openapi-typescript 生成物,格式由生成器控制
    'test-results/**', // Playwright 测试产物
    'playwright-report/**',
    'dist',
    'node_modules',
  ],
})
