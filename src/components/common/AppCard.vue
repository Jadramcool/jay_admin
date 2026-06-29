<script setup lang="ts">
import type { CSSProperties } from 'vue'

/**
 * AppCard — 基于 n-card 的统一卡片封装。
 *
 * 特性：
 * - 内置 loading/empty/collapsible 状态管理
 * - 可配置阴影层级 shadow (none/light/medium/heavy)
 * - 透传 n-card 常用 props (size/hoverable/segmented/closable/…)
 * - 透传全部 slots (header/header-extra/footer/action/cover)
 */
interface AppCardProps {
  title?: string
  size?: 'small' | 'medium' | 'large' | 'huge'
  hoverable?: boolean
  segmented?: boolean | { content?: boolean, footer?: boolean }
  contentStyle?: string | CSSProperties
  headerStyle?: string | CSSProperties
  footerStyle?: string | CSSProperties
  closable?: boolean
  shadow?: 'none' | 'light' | 'medium' | 'heavy'
  loading?: boolean
  loadingRows?: number
  emptyText?: string
  collapsible?: boolean
}

defineProps<AppCardProps>()

const collapsed = ref(false)
const slots = useSlots()

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

const hasContent = computed(() => {
  return slots.default && !slots.default().every((vnode) => {
    const children = (vnode.children as any) ?? []
    return typeof children === 'string' ? !children.trim() : false
  })
})
</script>

<template>
  <n-card
    :bordered="false"
    :size="size || 'small'"
    class="app-card"
    :class="[
      shadow ? `app-card--shadow-${shadow}` : 'app-card--shadow-light',
      { 'app-card--collapsed': collapsed },
    ]"
    :title="title"
    :hoverable="hoverable"
    :segmented="segmented"
    :content-style="contentStyle || 'padding: 16px;'"
    :header-style="headerStyle"
    :footer-style="footerStyle"
    :closable="closable"
  >
    <template v-if="collapsible" #header-extra>
      <button class="app-card__toggle" @click="toggleCollapse">
        <svg :class="{ 'app-card__toggle--rotated': collapsed }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <slot name="header-extra" />
    </template>
    <template v-else-if="$slots['header-extra']" #header-extra>
      <slot name="header-extra" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-if="$slots.action" #action>
      <slot name="action" />
    </template>
    <template v-if="$slots.cover" #cover>
      <slot name="cover" />
    </template>

    <template v-if="loading">
      <n-skeleton v-for="i in (loadingRows || 3)" :key="i" text :repeat="3" :style="{ '--i': i }" class="app-card__skeleton" />
    </template>
    <template v-else-if="!collapsed">
      <slot v-if="hasContent" />
      <div v-else-if="emptyText" class="app-card__empty">
        {{ emptyText }}
      </div>
      <slot v-else />
    </template>
  </n-card>
</template>

<style lang="scss" scoped>
.app-card {
  border-radius: 8px;

  &--collapsed {
    :deep(.n-card__content) {
      display: none;
    }
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-color-3);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--hover-color);
      color: var(--text-color-1);
    }

    svg {
      transition: transform 0.2s ease;
    }

    &--rotated {
      transform: rotate(-90deg);
    }
  }

  &__skeleton {
    margin-bottom: 8px;
    animation: fadeIn 0.3s ease both;
    animation-delay: calc(var(--i) * 0.05s);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  &__empty {
    text-align: center;
    padding: 24px 0;
    color: var(--text-color-4);
    font-size: 13px;
  }

  &--shadow-light {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    html.dark & {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    }
  }

  &--shadow-medium {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    html.dark & {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }
  }

  &--shadow-heavy {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    html.dark & {
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
    }
  }

  &--shadow-none {
    box-shadow: none;
  }
}
</style>
