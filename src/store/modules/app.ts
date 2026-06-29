import type { GlobalThemeOverrides } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'
import chroma from 'chroma-js'
import { defineStore } from 'pinia'
import { darkThemeOverrides, defaultFont, fontOptions, lightThemeOverrides, naiveThemeOverrides } from '@/settings'

// Module-level singleton: a single reactive listener for the OS color scheme.
// Declared once so every store instance shares the same subscription.
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

interface AppState {
  collapsed: boolean
  theme: GlobalThemeOverrides
  currentFont: string
  primaryColor: string
  colorMode: App.ColorMode
  showLogo: boolean
  showTabs: boolean
  showFooter: boolean
  showBreadcrumb: boolean
  loadFlag: boolean
  globalLoading: boolean
  transitionAnimation: App.TransitionAnimation
  loginSet: { formShowLabel: boolean }
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    collapsed: false,
    theme: naiveThemeOverrides as GlobalThemeOverrides,
    currentFont: defaultFont,
    primaryColor: '#18a058',
    colorMode: 'light',
    showLogo: true,
    showTabs: true,
    showFooter: true,
    showBreadcrumb: true,
    loadFlag: true,
    globalLoading: true,
    transitionAnimation: 'fade-slide',
    loginSet: { formShowLabel: true },
  }),
  getters: {
    // Resolved dark state: explicit 'dark', or 'auto' following the OS preference.
    isDark(): boolean {
      if (this.colorMode === 'dark')
        return true
      if (this.colorMode === 'auto')
        return prefersDark.value
      return false
    },
  },
  actions: {
    switchCollapsed() {
      this.collapsed = !this.collapsed
    },
    applyDarkClass() {
      document.documentElement.classList.toggle('dark', this.isDark)
    },
    applyDarkClassWithTransition() {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> }
      }

      if (!doc.startViewTransition) {
        this.applyDarkClass()
        return
      }

      const transition = doc.startViewTransition(() => {
        this.applyDarkClass()
      })
      transition.finished
        .catch(() => {})
    },
    setColorMode(mode: App.ColorMode) {
      this.colorMode = mode
      this.setPrimaryColor()
    },
    toggleDark() {
      this.setColorMode(this.isDark ? 'light' : 'dark')
    },
    setPrimaryColor(color?: string) {
      if (color)
        this.primaryColor = color
      const baseColor = this.primaryColor
      const isDark = this.isDark

      const primaryColorHover = chroma(baseColor).brighten(0.5).hex()
      const primaryColorPressed = chroma(baseColor).darken(0.5).hex()
      const primaryColorSuppl = chroma(baseColor).brighten(0.3).hex()

      this.theme = {
        common: {
          primaryColor: baseColor,
          primaryColorHover,
          primaryColorPressed,
          primaryColorSuppl,
          ...(isDark ? darkThemeOverrides.common : lightThemeOverrides.common),
        },
      }

      this.setupCssVar(baseColor, primaryColorHover, primaryColorPressed, primaryColorSuppl)
    },
    setupCssVar(primary: string, hover: string, pressed: string, suppl: string) {
      const style = document.documentElement.style
      style.setProperty('--primary-color', primary)
      style.setProperty('--primary-color-hover', hover)
      style.setProperty('--primary-color-pressed', pressed)
      style.setProperty('--primary-color-suppl', suppl)
      const rgb = chroma(primary).rgb()
      style.setProperty('--primary-color-rgb', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`)
    },
    setFont(fontKey: string) {
      this.currentFont = fontKey
      const fontValue = fontOptions[fontKey]?.value || fontOptions.system.value
      document.documentElement.style.setProperty('--font-family', fontValue)
      if (this.theme.common) {
        this.theme = {
          ...this.theme,
          common: { ...this.theme.common, fontFamily: fontValue },
        }
      }
    },
    setGlobalLoading(loading: boolean) {
      this.globalLoading = loading
    },
    reloadPage(delay = 0) {
      setTimeout(() => {
        this.loadFlag = false
        nextTick(() => {
          this.loadFlag = true
        })
      }, delay)
    },
  },
  persist: {
    pick: ['collapsed', 'currentFont', 'primaryColor', 'colorMode', 'showLogo', 'showTabs', 'showFooter', 'showBreadcrumb', 'transitionAnimation'],
  },
})
