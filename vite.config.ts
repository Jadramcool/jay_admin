import path from "path";
import { ConfigEnv, defineConfig, loadEnv } from "vite";
import vitePlugins from "./config/vitePlugins";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig((env: ConfigEnv) => {
  const viteEnv = loadEnv(env.mode, "env", "VITE");
  const { VITE_PORT, VITE_OPEN, VITE_DROP_CONSOLE, VITE_BASE } = viteEnv;

  return {
    base: VITE_BASE || "/",
    envDir: "env",
    plugins: [...vitePlugins(env, viteEnv), vueDevTools()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "#": path.resolve(__dirname, "typings"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: Number(VITE_PORT) || 4000,
      open: VITE_OPEN === "true",
      proxy:
        viteEnv.VITE_PROXY === "true"
          ? {
              "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
              },
            }
          : undefined,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "@/assets/styles/color.scss" as *; @use "@/assets/styles/font.scss" as *;',
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "axios",
        "dayjs",
        "lodash-es",
        "@vueuse/core",
        "naive-ui",
      ],
    },
    build: {
      target: "es2015",
      outDir: "dist",
      assetsDir: "assets",
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) return "vendor";
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
      minify: "esbuild",
    },
  };
});

