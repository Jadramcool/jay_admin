import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ConfigEnv, type PluginOption } from 'vite';

export default (env: ConfigEnv, viteEnv: Record<string, string>): PluginOption[] => {
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
  ];

  return plugins;
};
