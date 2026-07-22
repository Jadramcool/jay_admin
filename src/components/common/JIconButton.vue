<script setup lang="ts">
import type { VNode } from 'vue'
import JIcon from './JIcon.vue'

interface JIconButtonProps {
  /** 图标名称（@iconify/icon 格式） */
  icon: string
  /** 按钮的无障碍名称及悬停提示 */
  label: string
  /** 图标大小 */
  size?: number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<JIconButtonProps>(), {
  size: 18,
  disabled: false,
})

const slots = defineSlots<{
  default?: () => VNode[]
}>()
</script>

<template>
  <button
    type="button"
    class="j-icon-button"
    :class="{ 'j-icon-button--with-content': slots.default }"
    :disabled="props.disabled"
    :aria-label="props.label"
    :title="props.label"
  >
    <JIcon :icon="props.icon" :size="props.size" />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.j-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--text-color-2, inherit);
  line-height: 1;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--text-color-1, inherit);
    background-color: var(--hover-color, var(--layout-bg-hover));
  }

  &:active:not(:disabled) {
    color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.1);
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.j-icon-button--with-content {
  width: auto;
  padding: 0 8px;
  gap: 6px;
}
</style>
