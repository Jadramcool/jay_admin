<template>
  <n-breadcrumb>
    <n-breadcrumb-item
      v-for="item in breadcrumbs"
      :key="item.path"
      :clickable="!!(item.redirect || item.path !== route.path)"
    >
      <n-icon v-if="item.icon" size="16">
        <icon :icon="item.icon" />
      </n-icon>
      {{ item.title }}
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const route = useRoute();

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((r) => r.path !== '/');
  return matched.map((r) => ({
    path: r.path,
    title: (r.meta?.title as string) || '',
    icon: r.meta?.icon as string,
    redirect: r.redirect as string,
  }));
});
</script>
