<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="flex-col-center wh-full">
    <h1 class="text-6xl font-bold" style="color: var(--primary-color)">
      403
    </h1>
    <p class="text-18px text-#666 mt-16px">
      抱歉，您没有权限访问此页面
    </p>
    <n-button type="primary" class="mt-24px" @click="router.push('/')">
      返回首页
    </n-button>
  </div>
</template>
