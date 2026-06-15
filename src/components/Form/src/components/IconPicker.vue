<template>
  <n-popselect
    :value="value"
    :options="iconOptions"
    scrollable
    style="width: 300px"
    @update:value="handleChange">
    <n-button>
      <template #icon>
        <n-icon size="18">
          <Icon :icon="value || 'icon-park-outline:add'" />
        </n-icon>
      </template>
      {{ value ? "更换图标" : "选择图标" }}
    </n-button>
  </n-popselect>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  value: { type: String, default: "" },
});

const emit = defineEmits(["update:value"]);

const commonIcons = [
  "icon-park-outline:home",
  "icon-park-outline:setting",
  "icon-park-outline:user",
  "icon-park-outline:lock",
  "icon-park-outline:system",
  "icon-park-outline:folder",
  "icon-park-outline:file-search",
  "icon-park-outline:list",
  "icon-park-outline:chart-histogram",
  "icon-park-outline:data",
  "icon-park-outline:mail",
  "icon-park-outline:message",
  "icon-park-outline:time",
  "icon-park-outline:document-folder",
  "icon-park-outline:search",
  "icon-park-outline:edit",
  "icon-park-outline:delete",
  "icon-park-outline:add",
  "icon-park-outline:check",
  "icon-park-outline:close",
];

const iconOptions = ref(
  commonIcons.map((icon) => ({
    label: icon,
    value: icon,
  })),
);

function handleChange(val: string) {
  emit("update:value", val);
}
</script>

