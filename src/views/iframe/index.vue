<template>
  <div class="wh-full">
    <iframe :src="url" class="wh-full" frameborder="0" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const url = computed(() => {
  return (route.meta?.originPath as string) || '';
});
</script>
