<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { useRouter } from 'vue-router'
import { JIconButton } from '@/components'
import { useAuthStore, useUserStore } from '@/store/modules'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()

const menuOptions: DropdownOption[] = [
  { label: '个人中心', key: 'profile' },
  { type: 'divider' },
  { label: '退出登录', key: 'logout' },
]

function handleSelect(key: string) {
  if (key === 'profile') {
    router.push('/user-center')
  }
  else if (key === 'logout') {
    window.$dialog?.warning({
      title: '提示',
      content: '确定要退出登录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        authStore.logout()
      },
    })
  }
}
</script>

<template>
  <n-dropdown trigger="click" :options="menuOptions" @select="handleSelect">
    <JIconButton icon="icon-park-outline:avatar" label="用户菜单" :size="22">
      <span>{{ userStore.userInfo?.name || userStore.userInfo?.username }}</span>
    </JIconButton>
  </n-dropdown>
</template>
