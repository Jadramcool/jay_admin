import { defineConfig, presetUno, presetAttributify } from 'unocss';
import presetRemToPx from '@unocss/preset-rem-to-px';

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetRemToPx()],
  shortcuts: {
    'wh-full': 'w-full h-full',
    'flex-center': 'flex items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'flex-between': 'flex items-center justify-between',
  },
});
