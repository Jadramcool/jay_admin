import type { GlobalThemeOverrides } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'
import chroma from 'chroma-js'
import { defineStore } from 'pinia'
import { usePublicConfig } from '@/composables/usePublicConfig'
import {
  darkThemeOverrides,
  defaultFont,
  fontOptions,
  lightThemeOverrides,
  naiveThemeOverrides,
} from '@/settings'

// Module-level singleton: a single reactive listener for the OS color scheme.
// Declared once so every store instance shares the same subscription.
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

interface AppState {
  collapsed: boolean
  theme: GlobalThemeOverrides
  resolvedDark: boolean
  themeTransitionId: number
  currentFont: string
  primaryColor: string
  primaryColorSource: App.PrimaryColorSource
  colorMode: App.ColorMode
  showLogo: boolean
  showTabs: boolean
  showTabIcon: boolean
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
    resolvedDark: false,
    themeTransitionId: 0,
    currentFont: defaultFont,
    primaryColor: '#18a058',
    primaryColorSource: 'config',
    colorMode: 'light',
    showLogo: true,
    showTabs: true,
    showTabIcon: true,
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
      return this.resolvedDark
    },
    systemPrefersDark(): boolean {
      return prefersDark.value
    },
  },
  actions: {
    switchCollapsed() {
      this.collapsed = !this.collapsed
    },
    applyDarkClass() {
      document.documentElement.classList.toggle('dark', this.isDark)
    },
    resolveColorMode(mode: App.ColorMode) {
      return mode === 'dark' || (mode === 'auto' && prefersDark.value)
    },
    async commitColorMode(mode: App.ColorMode, resolvedDark: boolean) {
      this.colorMode = mode
      this.resolvedDark = resolvedDark
      this.setPrimaryColor()
      this.applyDarkClass()
      await nextTick()
    },
    async applyColorModeWithTransition(mode: App.ColorMode) {
      const resolvedDark = this.resolveColorMode(mode)
      const doc = document as Document & {
        startViewTransition?: (cb: () => Promise<void>) => {
          finished: Promise<void>
        }
      }
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (!doc.startViewTransition || reduceMotion) {
        await this.commitColorMode(mode, resolvedDark)
        return
      }

      const transitionId = ++this.themeTransitionId
      document.documentElement.classList.add('theme-transitioning')
      try {
        const transition = doc.startViewTransition(() =>
          this.commitColorMode(mode, resolvedDark),
        )
        await transition.finished
      }
      catch {
        // The browser may skip an in-flight transition when the user toggles rapidly.
        await this.commitColorMode(mode, resolvedDark)
      }
      finally {
        if (transitionId === this.themeTransitionId)
          document.documentElement.classList.remove('theme-transitioning')
      }
    },
    syncColorMode(animate = false) {
      if (animate)
        return this.applyColorModeWithTransition(this.colorMode)
      return this.commitColorMode(
        this.colorMode,
        this.resolveColorMode(this.colorMode),
      )
    },
    setColorMode(mode: App.ColorMode) {
      const resolvedDark = this.resolveColorMode(mode)
      if (mode === this.colorMode && resolvedDark === this.isDark)
        return Promise.resolve()
      if (resolvedDark === this.isDark)
        return this.commitColorMode(mode, resolvedDark)
      return this.applyColorModeWithTransition(mode)
    },
    toggleDark() {
      return this.setColorMode(this.isDark ? 'light' : 'dark')
    },
    setPrimaryColor(color?: string) {
      if (color)
        this.primaryColor = color
      const baseColor = this.primaryColor
      const isDark = this.isDark

      const primaryColorHover = chroma(baseColor).brighten(0.5).hex()
      const primaryColorPressed = chroma(baseColor).darken(0.5).hex()
      const primaryColorSuppl = chroma(baseColor).brighten(0.3).hex()

      const modeTheme = isDark ? darkThemeOverrides : lightThemeOverrides
      const menuAccentColor = chroma(baseColor)
        .mix(isDark ? '#ffffff' : '#000000', isDark ? 0.25 : 0.12, 'rgb')
        .hex()
      const menuActiveColor = chroma(baseColor)
        .alpha(isDark ? 0.18 : 0.1)
        .css()
      const menuActiveHoverColor = chroma(baseColor)
        .alpha(isDark ? 0.24 : 0.15)
        .css()
      const menuActiveCollapsedColor = chroma(baseColor)
        .alpha(isDark ? 0.22 : 0.13)
        .css()
      const controlBorder = isDark ? '#3b3b43' : '#d8dde4'
      const controlColor = isDark ? '#1b1b20' : '#ffffff'
      const controlActiveColor = isDark ? '#202026' : '#ffffff'
      const controlFocusShadow = chroma(baseColor)
        .alpha(isDark ? 0.22 : 0.16)
        .css()

      this.theme = {
        ...naiveThemeOverrides,
        ...modeTheme,
        common: {
          ...naiveThemeOverrides.common,
          ...modeTheme.common,
          primaryColor: baseColor,
          primaryColorHover,
          primaryColorPressed,
          primaryColorSuppl,
        },
        Menu: {
          ...naiveThemeOverrides.Menu,
          ...modeTheme.Menu,
          itemColorActive: menuActiveColor,
          itemColorActiveHover: menuActiveHoverColor,
          itemColorActiveCollapsed: menuActiveCollapsedColor,
          itemTextColorActive: menuAccentColor,
          itemTextColorActiveHover: menuAccentColor,
          itemTextColorChildActive: menuAccentColor,
          itemTextColorChildActiveHover: menuAccentColor,
          itemIconColorActive: menuAccentColor,
          itemIconColorActiveHover: menuAccentColor,
          itemIconColorChildActive: menuAccentColor,
          itemIconColorChildActiveHover: menuAccentColor,
          arrowColorActive: menuAccentColor,
          arrowColorActiveHover: menuAccentColor,
          arrowColorChildActive: menuAccentColor,
          arrowColorChildActiveHover: menuAccentColor,
        },
        Input: {
          ...naiveThemeOverrides.Input,
          ...modeTheme.Input,
          color: controlColor,
          colorFocus: controlActiveColor,
          border: `1px solid ${controlBorder}`,
          borderHover: `1px solid ${baseColor}`,
          borderFocus: `1px solid ${baseColor}`,
          boxShadowFocus: `0 0 0 3px ${controlFocusShadow}`,
        },
        Select: {
          ...naiveThemeOverrides.Select,
          ...modeTheme.Select,
          peers: {
            ...naiveThemeOverrides.Select?.peers,
            ...modeTheme.Select?.peers,
            InternalSelection: {
              ...naiveThemeOverrides.Select?.peers?.InternalSelection,
              ...modeTheme.Select?.peers?.InternalSelection,
              color: controlColor,
              colorActive: controlActiveColor,
              border: `1px solid ${controlBorder}`,
              borderHover: `1px solid ${baseColor}`,
              borderActive: `1px solid ${baseColor}`,
              borderFocus: `1px solid ${baseColor}`,
              boxShadowHover: 'none',
              boxShadowActive: `0 0 0 3px ${controlFocusShadow}`,
              boxShadowFocus: `0 0 0 3px ${controlFocusShadow}`,
            },
          },
        },
      }

      this.setupCssVar(
        baseColor,
        primaryColorHover,
        primaryColorPressed,
        primaryColorSuppl,
      )
    },
    setupCssVar(
      primary: string,
      hover: string,
      pressed: string,
      suppl: string,
    ) {
      const style = document.documentElement.style
      style.setProperty('--primary-color', primary)
      style.setProperty('--primary-color-hover', hover)
      style.setProperty('--primary-color-pressed', pressed)
      style.setProperty('--primary-color-suppl', suppl)
      const rgb = chroma(primary).rgb()
      style.setProperty(
        '--primary-color-rgb',
        `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
      )
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
    /** 应用公开配置的主题色(用户手动自定义过则跳过) */
    async applyConfigPrimaryColor() {
      if (this.primaryColorSource === 'manual')
        return
      const color = await usePublicConfig('primary_color', '')
      if (color && color !== this.primaryColor)
        this.setPrimaryColor(color)
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
    resetSettings() {
      this.collapsed = false
      this.currentFont = defaultFont
      this.primaryColor = '#18a058'
      this.primaryColorSource = 'config'
      this.colorMode = 'light'
      this.resolvedDark = false
      this.showLogo = true
      this.showTabs = true
      this.showTabIcon = true
      this.showFooter = true
      this.showBreadcrumb = true
      this.transitionAnimation = 'fade-slide'
      this.setPrimaryColor()
      this.setFont(this.currentFont)
      this.applyDarkClass()
    },
  },
  persist: {
    pick: [
      'collapsed',
      'currentFont',
      'primaryColor',
      'primaryColorSource',
      'colorMode',
      'showLogo',
      'showTabs',
      'showTabIcon',
      'showFooter',
      'showBreadcrumb',
      'transitionAnimation',
    ],
  },
})
