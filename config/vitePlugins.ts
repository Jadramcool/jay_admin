import type { ConfigEnv, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default (_env: ConfigEnv, _viteEnv: Record<string, string>): PluginOption[] => {
  const plugins: PluginOption[] = [
    vue(),
    vueJsx(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          '@iconify/vue': ['Icon'],
        },
        '@vueuse/core',
      ],
      dts: 'typings/auto-imports.d.ts',
      dirs: [
        'src/utils',
        'src/components/Form/src/hooks',
        'src/components/Modal/src/hooks',
        'src/components/Drawer/src/hooks',
      ],
    }),
    Components({
      dirs: ['src/components'],
      resolvers: [NaiveUiResolver()],
      dts: 'typings/components.d.ts',
    }),
    UnoCSS(),
  ]

  return plugins
}
