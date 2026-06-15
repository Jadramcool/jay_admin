/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TOKEN_KEY: string
  readonly VITE_BASE: string
  readonly VITE_PORT: number
  readonly VITE_OPEN: boolean
  readonly VITE_DROP_CONSOLE: boolean
  readonly VITE_NEED_LOGIN: string
  readonly VITE_HOME_PATH: string
  readonly VITE_USE_HASH: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PROXY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
