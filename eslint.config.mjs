import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,
  typescript: true,
  ignores: [
    'typings/auto-imports.d.ts',
    'typings/components.d.ts',
    'dist',
    'node_modules',
  ],
})
