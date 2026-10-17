import type { ComponentType } from './types'
import cloneDeep from 'lodash-es/cloneDeep'

/**
 * 深合并但数组整体替换：lodash 的 merge 对数组按索引合并，
 * 缩短数组（如 schemas / componentProps.options / rules）时会残留旧元素，
 * 导致「清空校验规则」「减少下拉选项」这类更新失效。
 */
export function mergeReplacingArrays(target: any, patch: any): any {
  if (Array.isArray(patch))
    return cloneDeep(patch)
  if (patch !== null && typeof patch === 'object') {
    const out: Recordable = { ...(target ?? {}) }
    for (const [key, value] of Object.entries(patch))
      out[key] = mergeReplacingArrays(out[key], value)
    return out
  }
  return patch
}

export function createPlaceholderMessage(component?: ComponentType) {
  if (!component)
    return ''
  if (component === 'NInput')
    return '请输入'
  if (
    ['NPicker', 'NSelect', 'NCheckbox', 'NRadio', 'NSwitch', 'NDatePicker', 'NTimePicker'].includes(component)
  ) {
    return '请选择'
  }
  return ''
}
