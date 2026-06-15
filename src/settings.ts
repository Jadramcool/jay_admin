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

export const naiveThemeOverrides = {
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
  },
}

export const lightThemeOverrides = {
  common: {
    tabSelectedBg: '#f0f0f4',
  },
}

export const darkThemeOverrides = {
  common: {
    tabSelectedBg: '#1A171C',
  },
}
