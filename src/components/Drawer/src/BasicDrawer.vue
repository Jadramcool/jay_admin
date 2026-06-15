<template>
  <n-drawer
    v-model:show="showDrawer"
    v-bind="getBindValue"
    :width="width"
    :mask-closable="false"
    @after-leave="handleClose"
  >
    <n-drawer-content :title="title" :closable="true" :native-scrollbar="false">
      <slot />

      <template #footer v-if="$slots.footer || showFooter">
        <slot name="footer">
          <n-space justify="end">
            <n-button @click="closeDrawer">取消</n-button>
            <n-button type="primary" :loading="submitLoading" @click="handleOk">
              确认
            </n-button>
          </n-space>
        </slot>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

defineOptions({ name: 'BasicDrawer' });

interface Props {
  title?: string;
  width?: number | string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  showFooter?: boolean;
  submitLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: 500,
  placement: 'right',
  showFooter: false,
  submitLoading: false,
});

const emit = defineEmits(['register', 'ok', 'close']);

const showDrawer = ref(false);

const getBindValue = computed(() => {
  const { title, width, showFooter, submitLoading, ...rest } = props;
  return rest;
});

function openDrawer() {
  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
}

function handleOk() {
  emit('ok');
}

function handleClose() {
  emit('close');
}

const drawerAction = { openDrawer, closeDrawer, setShow: (v: boolean) => { showDrawer.value = v; } };

onMounted(() => {
  emit('register', drawerAction);
});

defineExpose({ openDrawer, closeDrawer });
</script>
