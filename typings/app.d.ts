declare namespace App {
  type TransitionAnimation
    = | 'fade-slide'
      | 'fade'
      | 'fade-bottom'
      | 'fade-scale'
      | 'zoom-fade'
      | 'zoom-out'
      | 'none'

  type ColorMode = 'light' | 'dark' | 'auto'

  /** 主题色来源:config=跟随系统配置,manual=用户在设置里手动自定义 */
  type PrimaryColorSource = 'config' | 'manual'

  type LayoutType = 'normal' | 'empty' | 'full-content'
}
