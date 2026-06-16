import type { GlobalThemeOverrides } from 'naive-ui'
import chroma from 'chroma-js'
import { defineStore } from 'pinia'
import { defaultFont, fontOptions, lightThemeOverrides, naiveThemeOverrides } from '@/settings'

interface AppState {
  collapsed: boolean
  theme: GlobalThemeOverrides
  currentFont: string
  primaryColor: string
  showLogo: boolean
  showTabs: boolean
  showFooter: boolean
  showBreadcrumb: boolean
  loadFlag: boolean
  transitionAnimation: App.TransitionAnimation
  loginSet: { formShowLabel: boolean }
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    collapsed: false,
    theme: naiveThemeOverrides as GlobalThemeOverrides,
    currentFont: defaultFont,
    primaryColor: '#18a058',
    showLogo: true,
    showTabs: true,
    showFooter: true,
    showBreadcrumb: true,
    loadFlag: true,
    transitionAnimation: 'fade-slide',
    loginSet: { formShowLabel: true },
  }),
  actions: {
    switchCollapsed() {
      this.collapsed = !this.collapsed
    },
    setPrimaryColor(color?: string) {
      if (color)
        this.primaryColor = color
      const baseColor = this.primaryColor

      const primaryColorHover = chroma(baseColor).brighten(0.5).hex()
      const primaryColorPressed = chroma(baseColor).darken(0.5).hex()
      const primaryColorSuppl = chroma(baseColor).brighten(0.3).hex()

      this.theme = {
        common: {
          primaryColor: baseColor,
          primaryColorHover,
          primaryColorPressed,
          primaryColorSuppl,
          ...lightThemeOverrides.common,
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
    pick: ['collapsed', 'currentFont', 'primaryColor', 'showLogo', 'showTabs', 'showFooter', 'showBreadcrumb', 'transitionAnimation'],
  },
})
