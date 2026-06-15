<template>
  <div />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const targetPath = (route.params.path as string[])?.join('/') || '/';
if (targetPath) {
  router.replace({
    path: '/' + targetPath,
    query: route.query,
    hash: route.hash,
  });
}
</script>
