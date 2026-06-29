<script setup lang="ts">
import type { CSSProperties } from 'vue'

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
}

defineProps<AppCardProps>()
</script>

<template>
  <n-card
    :bordered="false"
    :size="size || 'small'"
    class="app-card"
    :class="[shadow ? `app-card--shadow-${shadow}` : 'app-card--shadow-light']"
    :title="title"
    :hoverable="hoverable"
    :segmented="segmented"
    :content-style="contentStyle || 'padding: 16px;'"
    :header-style="headerStyle"
    :footer-style="footerStyle"
    :closable="closable"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots['header-extra']" #header-extra>
      <slot name="header-extra" />
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
    <slot />
  </n-card>
</template>

<style lang="scss" scoped>
.app-card {
  border-radius: 8px;

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
