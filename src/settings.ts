import type { GlobalThemeOverrides } from 'naive-ui'

export const defaultLayout = 'normal'

export const fontOptions: Record<string, { name: string, value: string, description: string }> = {
  'smiley-sans': {
    name: '得意黑',
    value: 'Smiley Sans',
    description: '得意黑体 - 现代简洁',
  },
  'harmony-sans': {
    name: '鸿蒙字体',
    value: 'HarmonySans',
    description: '鸿蒙字体 - 优雅舒适',
  },
  'LXGWWenKai': {
    name: '霞鹜文楷',
    value: 'LXGWWenKai',
    description: '霞鹜文楷 - 优雅舒适',
  },
  'system': {
    name: 'System',
    value:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    description: '系统默认字体',
  },
}

export const defaultFont = 'smiley-sans'

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: fontOptions[defaultFont].value,
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    primaryColorSuppl: '#36ad6a',
    infoColor: '#2080f0',
    infoColorHover: '#4098fc',
    infoColorPressed: '#1060c9',
    infoColorSuppl: '#4098fc',
    successColor: '#18a058',
    successColorHover: '#36ad6a',
    successColorPressed: '#0c7a43',
    successColorSuppl: '#36ad6a',
    warningColor: '#f0a020',
    warningColorHover: '#fcb040',
    warningColorPressed: '#c97c10',
    warningColorSuppl: '#fcb040',
    errorColor: '#d03050',
    errorColorHover: '#de576d',
    errorColorPressed: '#ab1f3f',
    errorColorSuppl: '#de576d',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontSize: '14px',
    fontSizeMedium: '14px',
    heightMedium: '38px',
    heightSmall: '32px',
  },
  Button: {
    heightSmall: '32px',
    heightMedium: '38px',
    heightLarge: '44px',
    borderRadiusSmall: '7px',
    borderRadiusMedium: '8px',
    borderRadiusLarge: '9px',
    fontWeight: '500',
    paddingSmall: '0 13px',
    paddingMedium: '0 17px',
  },
  Input: {
    heightSmall: '32px',
    heightMedium: '38px',
    heightLarge: '44px',
    borderRadius: '8px',
    paddingSmall: '0 10px',
    paddingMedium: '0 12px',
    paddingLarge: '0 14px',
  },
  Card: {
    borderRadius: '12px',
    titleFontWeight: '600',
    paddingSmall: '16px 18px',
    paddingMedium: '20px 22px',
  },
  Menu: {
    borderRadius: '8px',
    itemHeight: '42px',
    fontSize: '14px',
  },
  DataTable: {
    borderRadius: '10px',
    thFontWeight: '600',
    thPaddingSmall: '11px 12px',
    thPaddingMedium: '12px 14px',
    tdPaddingSmall: '10px 12px',
    tdPaddingMedium: '11px 14px',
    paginationMargin: '16px 0 0 0',
  },
  Pagination: {
    itemBorderRadius: '7px',
    itemSizeSmall: '30px',
    itemSizeMedium: '34px',
  },
}

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: '#f5f6f8',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    inputColor: '#ffffff',
    actionColor: '#f6f7f9',
    hoverColor: '#f1f3f6',
    tableHeaderColor: '#f5f6f8',
    borderColor: '#dfe3e8',
    dividerColor: '#e8ebef',
    textColorBase: '#1f2329',
    textColor1: '#1f2329',
    textColor2: '#4b515b',
    textColor3: '#7a818c',
    placeholderColor: '#a6acb5',
  },
  Card: {
    borderColor: '#e1e5ea',
    boxShadow: '0 8px 28px rgba(24, 31, 42, 0.06)',
  },
  DataTable: {
    borderColor: '#e7eaee',
    thColor: '#f5f6f8',
    thColorHover: '#eef1f4',
    thTextColor: '#4c535d',
    tdTextColor: '#353b44',
    tdColorHover: '#f6f8fa',
    tdColorStriped: '#fafbfc',
  },
  Menu: {
    itemColorHover: '#f1f3f6',
    itemTextColor: '#4b515b',
    itemIconColor: '#7a818c',
  },
}

// Dark-mode-specific Naive UI overrides.
// The bulk of dark theming is handled by Naive's built-in `darkTheme` base;
// here we only tweak the few surface tokens that diverge from the light set.
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: '#101014',
    cardColor: '#18181c',
    modalColor: '#18181c',
    popoverColor: '#202024',
    tableColor: '#18181c',
    inputColor: '#202024',
    actionColor: '#202024',
    hoverColor: '#27272c',
    tableHeaderColor: '#202024',
    borderColor: '#34343a',
    dividerColor: '#2b2b30',
    textColor1: '#ededf0',
    textColor2: '#c7c7ce',
    textColor3: '#96969f',
    placeholderColor: '#72727c',
  },
  Card: {
    borderColor: '#303036',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.24)',
  },
  DataTable: {
    borderColor: '#2b2b30',
    thColor: '#202024',
    thColorHover: '#27272c',
    tdColorHover: '#222227',
    tdColorStriped: '#1b1b20',
  },
  Menu: {
    itemColorHover: '#242429',
  },
}
