<template>
  <div class="h-48px flex-between px-16px">
    <div class="flex items-center gap-12px">
      <MenuCollapse />
      <Breadcrumb />
    </div>
    <div class="flex items-center gap-8px">
      <DarkModeSwitch />
      <FontSelector />
      <FullScreen />
      <Setting />
      <UserControl />
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuCollapse from './MenuCollapse.vue';
import Breadcrumb from './Breadcrumb.vue';
import DarkModeSwitch from './components/DarkModeSwitch.vue';
import FontSelector from './components/FontSelector.vue';
import FullScreen from './components/FullScreen.vue';
import Setting from './components/Setting.vue';
import UserControl from './components/UserControl.vue';
</script>
