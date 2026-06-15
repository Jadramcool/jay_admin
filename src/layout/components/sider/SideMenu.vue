<template>
  <n-menu
    :value="activeKey"
    :options="menuOptions"
    :collapsed="appStore.collapsed"
    :collapsed-icon-size="22"
    :indent="18"
    :root-indent="18"
    class="side-menu"
    @update:value="handleMenuSelect"
  />
</template>

<script setup lang="ts">
import { useAppStore, usePermissionStore } from '@/store/modules';

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const router = useRouter();
const route = useRoute();

const menuOptions = computed(() => permissionStore.menus);

const activeKey = computed(() => {
  const path = route.path;
  let bestMatch: string | undefined;
  let bestLength = 0;

  const search = (items: any[]) => {
    for (const item of items) {
      if (item.path && path.startsWith(item.path) && item.path.length > bestLength) {
        bestMatch = item.key;
        bestLength = item.path.length;
      }
      if (item.children) search(item.children);
    }
  };
  search(menuOptions.value);
  return bestMatch || (route.name as string);
});

function handleMenuSelect(key: string, item: any) {
  if (item.originPath) {
    window.open(item.originPath, '_blank');
    return;
  }
  router.push({ name: key });
}
</script>

<style scoped>
.side-menu {
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
