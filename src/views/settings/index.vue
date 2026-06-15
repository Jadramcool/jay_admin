<script setup lang="ts">
import { useDrawer } from '@/components/Drawer/src/hooks/useDrawer'
import { fontOptions } from '@/settings'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
const [register, { openDrawer }] = useDrawer()

const modes = [
  { label: '浅色', value: 'light' as const },
  { label: '深色', value: 'dark' as const },
  { label: '自动', value: 'auto' as const },
]

function getStoredMode() {
  try {
    const v = localStorage.getItem('vueuse-color-scheme')
    if (v === 'dark' || v === 'light' || v === 'auto')
      return v
  }
  catch {}
  return 'auto'
}

const currentMode = ref(getStoredMode())

function handleModeChange(mode: 'light' | 'dark' | 'auto') {
  appStore.setColorMode(mode)
  currentMode.value = getStoredMode()
}

const fontOptionsList = computed(() =>
  Object.entries(fontOptions).map(([key, val]) => ({
    label: val.name,
    value: key,
  })),
)

defineExpose({ openDrawer })
</script>

<template>
  <BasicDrawer title="系统设置" width="380" @register="register">
    <div class="settings-content">
      <!-- 主题模式 -->
      <div class="setting-section">
        <h3 class="section-title">
          主题模式
        </h3>
        <div class="mode-btns">
          <n-button
            v-for="mode in modes"
            :key="mode.value"
            :type="currentMode === mode.value ? 'primary' : 'default'"
            size="small"
            class="mode-btn"
            @click="handleModeChange(mode.value)"
          >
            {{ mode.label }}
          </n-button>
        </div>
      </div>

      <!-- 系统字体 -->
      <div class="setting-section">
        <h3 class="section-title">
          系统字体
        </h3>
        <n-select
          :value="appStore.currentFont"
          :options="fontOptionsList"
          size="small"
          @update:value="appStore.setFont"
        />
      </div>

      <!-- 主色 -->
      <div class="setting-section">
        <h3 class="section-title">
          主色
        </h3>
        <n-color-picker
          :value="appStore.primaryColor"
          :swatches="['#18a058', '#2080f0', '#f0a020', '#d03050', '#8a2be2']"
          size="small"
          @update:value="appStore.setPrimaryColor"
        />
      </div>

      <!-- 界面显示 -->
      <div class="setting-section">
        <h3 class="section-title">
          界面显示
        </h3>
        <div class="toggle-list">
          <div class="toggle-item">
            <span>显示Logo</span>
            <n-switch v-model:value="appStore.showLogo" size="small" />
          </div>
          <div class="toggle-item">
            <span>显示标签页</span>
            <n-switch v-model:value="appStore.showTabs" size="small" />
          </div>
          <div class="toggle-item">
            <span>显示面包屑</span>
            <n-switch v-model:value="appStore.showBreadcrumb" size="small" />
          </div>
          <div class="toggle-item">
            <span>显示页脚</span>
            <n-switch v-model:value="appStore.showFooter" size="small" />
          </div>
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-section {
  background: rgba(128, 128, 128, 0.04);
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 12px;
  opacity: 0.65;
}

.mode-btns {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.toggle-item + .toggle-item {
  border-top: 1px solid rgba(128, 128, 128, 0.08);
}
</style>
