<script setup lang="ts">
import type { DepartmentTableExpose } from '../types'
import { Icon } from '@iconify/vue'
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { DepartmentApi } from '@/api/system'
import { useMemberSchema } from '../member-schema'

const props = defineProps<{
  departmentId: number | null
  includeChildren: boolean
}>()

const keyword = shallowRef('')
const tableRef = useTemplateRef<DepartmentTableExpose>('tableRef')
const { columns } = useMemberSchema()

async function loadMembers(params: Api.PageParams) {
  if (!props.departmentId)
    return { list: [], pagination: { page: 1, pageSize: 10, total: 0 } }
  return DepartmentApi.members(props.departmentId, {
    ...params,
    includeChildren: props.includeChildren,
    keyword: keyword.value.trim() || undefined,
  })
}

async function reload(resetPage = true) {
  if (resetPage)
    tableRef.value?.setPagination({ page: 1 })
  await tableRef.value?.reload(resetPage ? { page: 1 } : undefined)
}

function handleClear() {
  void reload()
}

watch(
  () => [props.departmentId, props.includeChildren] as const,
  async () => {
    await nextTick()
    await reload()
  },
  { immediate: true },
)

defineExpose({ reload })
</script>

<template>
  <div class="department-members">
    <div class="department-members__toolbar">
      <h3 class="department-members__title text-base">
        部门成员
      </h3>
      <n-input-group class="department-members__search">
        <n-input
          v-model:value="keyword"
          :input-props="{
            'aria-label': '搜索部门成员',
            'autocomplete': 'off',
            'name': 'department-member-search',
          }"
          placeholder="搜索姓名或账号…"
          clearable
          size="small"
          @clear="handleClear"
          @keyup.enter="reload()"
        />
        <n-button aria-label="搜索成员" size="small" @click="reload()">
          <template #icon>
            <Icon aria-hidden="true" icon="mdi:magnify" />
          </template>
          搜索
        </n-button>
      </n-input-group>
    </div>

    <BasicTable
      ref="tableRef"
      :columns="columns"
      :request="loadMembers"
      :row-key="(row: System.User) => row.id"
      :auto-load="false"
      :show-toolbar="false"
      :bordered="false"
      :scroll-x="830"
      :single-line="false"
      size="small"
    />
  </div>
</template>

<style lang="scss" scoped>
.department-members {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__title {
    margin: 0;
    color: var(--card-header-text);
    font-weight: 600;
  }

  &__search {
    width: min(320px, 100%);
  }
}

@media (max-width: 640px) {
  .department-members__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .department-members__search {
    width: 100%;
  }
}
</style>
