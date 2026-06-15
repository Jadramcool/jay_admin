<template>
  <n-card title="仪表盘" :bordered="false" size="small">
    <n-space vertical>
      <n-alert type="success" :bordered="false">
        欢迎回来，{{ userStore.userInfo?.name || userStore.userInfo?.username }}
      </n-alert>

      <n-grid cols="1 s:2 m:3 l:4" :x-gap="16" :y-gap="16">
        <n-gi v-for="item in stats" :key="item.label">
          <n-card :title="item.label" size="small" hoverable>
            <template #header-extra>
              <n-icon size="24" :color="item.color">
                <icon :icon="item.icon" />
              </n-icon>
            </template>
            <p class="text-2xl font-bold">{{ item.value }}</p>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules';
import { Icon } from '@iconify/vue';

const userStore = useUserStore();

const stats = [
  { label: '用户数', value: '-', icon: 'icon-park-outline:user', color: '#18a058' },
  { label: '角色数', value: '-', icon: 'icon-park-outline:permissions', color: '#2080f0' },
  { label: '菜单数', value: '-', icon: 'icon-park-outline:menu', color: '#f0a020' },
  { label: '操作日志', value: '-', icon: 'icon-park-outline:log', color: '#d03050' },
];
</script>
