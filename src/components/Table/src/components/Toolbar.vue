<script setup lang="ts" name="Toolbar">
import { shallowRef } from 'vue';
import { Icon } from '@iconify/vue';
import { useComponentTableStore } from '@/store/modules';
import { VueDraggable } from 'vue-draggable-plus';

const emit = defineEmits<{
  refresh: [];
  add: [];
  batchDelete: [];
  resetColumns: [];
}>();

const props = defineProps<{
  showAddBtn?: boolean;
  showBatchDeleteBtn?: boolean;
  showColumnsSetting?: boolean;
}>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  required: true,
});

const componentTableStore = useComponentTableStore();

const tableSize = shallowRef(componentTableStore.size);
const tableSizeOptions = computed(() => [
  { label: '紧凑', key: 'small' },
  { label: '默认', key: 'medium' },
  { label: '宽松', key: 'large' },
]);

const handleSizeSelect = (key: string) => {
  tableSize.value = key;
  componentTableStore.setSize(key);
};

const handleBatchDelete = () => emit('batchDelete');
const handleRefresh = () => emit('refresh');
const handleAdd = () => emit('add');
</script>

<template>
  <div
    class="flex justify-end my-1"
    style="display: flex; justify-content: flex-end; align-items: center; gap: 8px">
    <n-space>
      <slot></slot>
      <n-button
        v-if="props.showAddBtn"
        type="primary"
        ghost
        size="small"
        @click="handleAdd">
        <template #icon>
          <n-icon><icon icon="icon-park-outline:plus" /></n-icon>
        </template>
        新增
      </n-button>
      <n-button
        v-if="props.showBatchDeleteBtn"
        type="error"
        ghost
        size="small"
        @click="handleBatchDelete">
        <template #icon>
          <n-icon><icon icon="icon-park-outline:delete" /></n-icon>
        </template>
        批量删除
      </n-button>
      <n-button ghost size="small" @click="handleRefresh">
        <template #icon>
          <n-icon><icon icon="icon-park-outline:refresh" /></n-icon>
        </template>
        刷新
      </n-button>
      <n-popover
        v-if="props.showColumnsSetting"
        placement="bottom-end"
        trigger="click">
        <template #trigger>
          <n-button ghost size="small">
            <template #icon>
              <n-icon><icon icon="icon-park-outline:column" /></n-icon>
            </template>
            列设置
          </n-button>
        </template>
        <VueDraggable v-model="columns" :animation="150" filter=".none_draggable">
          <div
            v-for="item in columns"
            :key="item.key"
            class="h-36px flex-y-center items-center rd-4px px-2px hover:(bg-primary bg-opacity-50 text-white)"
            style="display: flex; align-items: center; padding: 2px 4px; border-radius: 4px; cursor: move">
            <n-icon size="16" style="margin-right: 4px">
              <icon icon="si:drag-indicator-alt-duotone" />
            </n-icon>
            <n-checkbox v-model:checked="item.checked" class="none_draggable flex-1">
              {{ item.title }}
            </n-checkbox>
          </div>
        </VueDraggable>
        <n-divider style="margin: 8px 0" />
        <div style="display: flex; justify-content: center">
          <n-button size="tiny" quaternary @click="emit('resetColumns')">恢复默认</n-button>
        </div>
      </n-popover>
    </n-space>
    <n-dropdown
      :options="tableSizeOptions"
      trigger="click"
      @select="handleSizeSelect">
      <n-button ghost size="small">
        <template #icon>
          <n-icon><icon icon="mdi:human-male-height-variant" /></n-icon>
        </template>
      </n-button>
    </n-dropdown>
  </div>
</template>
