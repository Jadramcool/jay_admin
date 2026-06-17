<script setup lang="ts">
import { computed } from 'vue'
import { useDrawer } from '@/components/Drawer/src/hooks/useDrawer'
import { fontOptions } from '@/settings'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
const [register, { openDrawer }] = useDrawer()

const fontOptionsList = computed(() =>
  Object.entries(fontOptions).map(([key, val]) => ({
    label: val.name,
    value: key,
  })),
)

const transitionOptions: { label: string, value: App.TransitionAnimation }[] = [
  { label: '渐变滑动', value: 'fade-slide' },
  { label: '渐变', value: 'fade' },
  { label: '底部渐变', value: 'fade-bottom' },
  { label: '缩放渐变', value: 'fade-scale' },
  { label: '缩放', value: 'zoom-fade' },
  { label: '缩小', value: 'zoom-out' },
  { label: '无动画', value: 'none' },
]

const colorModeOptions: { label: string, value: App.ColorMode }[] = [
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' },
  { label: '跟随系统', value: 'auto' },
]

defineExpose({ openDrawer })
</script>

<template>
  <BasicDrawer title="系统设置" width="380" @register="register">
    <div class="settings-content">
      <!-- 系统字体 -->
      <div class="setting-section">
        <h3 class="section-title text-sm">
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
        <h3 class="section-title text-sm">
          主色
        </h3>
        <n-color-picker
          :value="appStore.primaryColor"
          :swatches="['#18a058', '#2080f0', '#f0a020', '#d03050', '#8a2be2']"
          size="small"
          @update:value="appStore.setPrimaryColor"
        />
      </div>

      <!-- 主题模式 -->
      <div class="setting-section">
        <h3 class="section-title text-sm">
          主题模式
        </h3>
        <n-radio-group
          :value="appStore.colorMode"
          @update:value="appStore.setColorMode"
        >
          <n-space>
            <n-radio
              v-for="opt in colorModeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </div>

      <!-- 界面显示 -->
      <div class="setting-section">
        <h3 class="section-title text-sm">
          界面显示
        </h3>
        <div class="toggle-list">
          <div class="toggle-item text-sm">
            <span>显示Logo</span>
            <n-switch v-model:value="appStore.showLogo" size="small" />
          </div>
          <div class="toggle-item text-sm">
            <span>显示标签页</span>
            <n-switch v-model:value="appStore.showTabs" size="small" />
          </div>
          <div class="toggle-item text-sm">
            <span>显示面包屑</span>
            <n-switch v-model:value="appStore.showBreadcrumb" size="small" />
          </div>
          <div class="toggle-item text-sm">
            <span>显示页脚</span>
            <n-switch v-model:value="appStore.showFooter" size="small" />
          </div>
        </div>
      </div>

      <!-- 页面动画 -->
      <div class="setting-section">
        <h3 class="section-title text-sm">
          页面动画
        </h3>
        <n-select
          :value="appStore.transitionAnimation"
          :options="transitionOptions"
          size="small"
          @update:value="appStore.transitionAnimation = $event"
        />
      </div>
    </div>
  </BasicDrawer>
</template>

<style lang="scss" scoped>
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
  font-weight: 600;
  margin: 0 0 12px;
  opacity: 0.65;
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
}

.toggle-item + .toggle-item {
  border-top: 1px solid rgba(128, 128, 128, 0.08);
}
</style>
