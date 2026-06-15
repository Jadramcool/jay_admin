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

  type LayoutType = 'normal' | 'empty' | 'full-content'
}
