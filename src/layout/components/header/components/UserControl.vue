<template>
  <n-dropdown trigger="click" :options="menuOptions" @select="handleSelect">
    <n-button quaternary size="small">
      <template #icon>
        <n-icon size="22">
          <icon icon="icon-park-outline:avatar" />
        </n-icon>
      </template>
      <span>{{ userStore.userInfo?.name || userStore.userInfo?.username }}</span>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { useUserStore, useAuthStore } from '@/store/modules';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import type { DropdownOption } from 'naive-ui';

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const menuOptions: DropdownOption[] = [
  { label: '个人中心', key: 'profile' },
  { type: 'divider' },
  { label: '退出登录', key: 'logout' },
];

function handleSelect(key: string) {
  if (key === 'logout') {
    window.$dialog?.warning({
      title: '提示',
      content: '确定要退出登录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        authStore.logout();
      },
    });
  }
}
</script>
