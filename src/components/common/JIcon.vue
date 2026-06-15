<template>
  <n-icon
    v-if="props.icon"
    :size="props.size"
    :depth="props.depth"
    :color="iconColor || props.color"
    :class="{ 'cursor-pointer': props.hover, 'j-icon-spin': props.spin }">
    <Icon :icon="props.icon" />
  </n-icon>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useAppStore } from "@/store/modules";

interface JIconProps {
  /** 图标名称（@iconify/icon 格式） */
  icon?: string;
  /** 图标颜色 */
  color?: string;
  /** 图标大小 */
  size?: number;
  /** 图标深度 1-5 */
  depth?: 1 | 2 | 3 | 4 | 5;
  /** 悬停时显示手型指针 */
  hover?: boolean;
  /** 主题色类型：primary / info / success / warning / error */
  type?: "primary" | "info" | "success" | "warning" | "error";
  /** 旋转动画 */
  spin?: boolean;
}

const props = withDefaults(defineProps<JIconProps>(), {
  size: 18,
});

const appStore = useAppStore();

const iconColor = computed(() => {
  if (props.color) return props.color;
  if (!props.type) return undefined;
  const typeColorMap: Record<string, string> = {
    primary: appStore.primaryColor,
  };
  return typeColorMap[props.type];
});
</script>

<style scoped>
.j-icon-spin {
  animation: j-icon-rotate 1.5s linear infinite;
}
@keyframes j-icon-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>

