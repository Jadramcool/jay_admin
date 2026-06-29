<script setup lang="ts">
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

const sysInfo = ref<Dashboard.SystemInfo | null>(null)
const loading = ref(true)

const resources = computed(() => [
  { label: 'CPU', value: sysInfo.value?.cpu ?? 0, color: '#18a058' },
  { label: '内存', value: sysInfo.value?.memory ?? 0, color: '#2080f0' },
  { label: '磁盘', value: sysInfo.value?.disk ?? 0, color: '#f0a020' },
])

watch(() => props.visible, (v) => {
  if (v && !sysInfo.value)
    loadSysInfo()
}, { immediate: true })

async function loadSysInfo() {
  loading.value = true
  try {
    sysInfo.value = await DashboardApi.systemInfo()
  }
  catch {
    // ignore
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="sysinfo">
    <h3 class="sysinfo__title">
      系统信息
    </h3>

    <n-skeleton v-if="loading" :repeat="5" text />
    <template v-else>
      <div v-for="res in resources" :key="res.label" class="sysinfo__resource">
        <div class="sysinfo__res-top">
          <span class="sysinfo__res-label">{{ res.label }}</span>
          <span class="sysinfo__res-value" :style="{ color: res.color }">{{ res.value }}%</span>
        </div>
        <div class="sysinfo__bar" :style="{ '--bar-clr': res.color }">
          <div class="sysinfo__bar-fill" :style="{ width: `${res.value}%` }" />
        </div>
      </div>

      <div class="sysinfo__meta">
        <div class="sysinfo__kv">
          <span class="sysinfo__k">运行时间</span>
          <span class="sysinfo__v">{{ sysInfo?.uptime ?? '-' }}</span>
        </div>
        <div class="sysinfo__kv">
          <span class="sysinfo__k">版本</span>
          <span class="sysinfo__v">v{{ sysInfo?.version ?? '-' }}</span>
        </div>
        <div class="sysinfo__kv">
          <span class="sysinfo__k">Node.js</span>
          <span class="sysinfo__v">{{ sysInfo?.nodeVersion ?? '-' }}</span>
        </div>
        <div class="sysinfo__kv">
          <span class="sysinfo__k">平台</span>
          <span class="sysinfo__v">{{ sysInfo?.platform ?? '-' }}</span>
        </div>
        <div class="sysinfo__kv">
          <span class="sysinfo__k">数据记录</span>
          <span class="sysinfo__v">{{ sysInfo?.dbRecords ?? '-' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.sysinfo {
  padding: 20px 22px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--card-color) 90%, transparent);
  height: 100%;
}

.sysinfo__title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color-1);
}

.sysinfo__resource {
  margin-bottom: 14px;
}

.sysinfo__res-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sysinfo__res-label {
  font-size: 13px;
  color: var(--text-color-2);
  font-weight: 500;
}

.sysinfo__res-value {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.sysinfo__bar {
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--bar-clr) 10%, transparent);
  overflow: hidden;
}

.sysinfo__bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--bar-clr);
  transition: width 0.6s ease;
}

.sysinfo__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--divider-color);
}

.sysinfo__kv {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sysinfo__k {
  font-size: 11.5px;
  color: var(--text-color-4);
}

.sysinfo__v {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
}
</style>
