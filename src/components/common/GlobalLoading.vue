<script setup lang="ts">
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="appStore.globalLoading"
        class="global-loading"
      >
        <!-- blur backdrop -->
        <div class="backdrop" />

        <!-- content -->
        <div class="content">
          <div class="brand">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--primary-color)" />
              <text x="16" y="22" font-size="18" font-weight="bold" fill="white" text-anchor="middle">J</text>
            </svg>
            <span class="brand-text">JDM Admin</span>
          </div>
          <div class="loader" />
          <p class="loading-text">
            加载中...
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.global-loading {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: var(--n-body-color, #f5f7fa);
  opacity: 0.95;
  backdrop-filter: blur(4px);
}

html.dark .backdrop {
  background: #101014;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--n-text-color, #333);
  letter-spacing: -0.02em;
}

html.dark .brand-text {
  color: rgba(255, 255, 255, 0.85);
}

.loader {
  width: 120px;
  height: 22px;
  border-radius: 40px;
  color: #514b82;
  border: 2px solid;
  position: relative;
}

.loader::before {
  content: '';
  position: absolute;
  margin: 2px;
  width: 25%;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: inherit;
  background: currentColor;
  animation: l3 1s infinite linear;
}

@keyframes l3 {
  50% {
    left: 100%;
    transform: translateX(calc(-100% - 4px));
  }
}

.loading-text {
  margin: 0;
  font-size: 13px;
  color: var(--n-text-color-3, #999);
}

html.dark .loading-text {
  color: rgba(255, 255, 255, 0.4);
}

/* transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
