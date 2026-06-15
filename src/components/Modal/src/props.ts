import type { PropType } from 'vue'
import { NCard, NModal } from 'naive-ui'

export const modalProps = {
  ...NModal.props,
  closeFunc: { type: [Function, Object] as PropType<any>, default: null },
}

export const cardProps = {
  ...NCard.props,
  width: { type: [String, Number] as PropType<string | number>, default: '800px' },
  height: { type: [String, Number] as PropType<string | number>, default: '420px' },
  draggable: { type: Boolean, default: true },
}

export const footerProps = {
  showFooter: { type: Boolean, default: true },
  showOkButton: { type: Boolean, default: true },
  okType: { type: String as PropType<'default' | 'tertiary' | 'primary' | 'info' | 'success' | 'warning' | 'error'>, default: 'primary' },
  showCancelButton: { type: Boolean, default: true },
  confirmLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  cancelText: { type: String, default: '取消' },
  okText: { type: String, default: '确认' },
}

export const basicProps = {
  ...modalProps,
  ...cardProps,
  ...footerProps,
}
