import type { ComponentType } from './types';

export function createPlaceholderMessage(component?: ComponentType) {
  if (!component) return '';
  if (component === 'NInput') return '请输入';
  if (
    ['NPicker', 'NSelect', 'NCheckbox', 'NRadio', 'NSwitch', 'NDatePicker', 'NTimePicker'].includes(component)
  ) {
    return '请选择';
  }
  return '';
}
