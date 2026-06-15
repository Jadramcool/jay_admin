<script setup lang="ts">
import { ref } from 'vue'
import { MenuApi, RoleApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

const roleId = ref<number>(0)
const checkedMenuIds = ref<number[]>([])
const menuTree = ref<any[]>([])

const [registerModal, { closeModal }] = useModalInner(async (data: any) => {
  if (data?.record) {
    roleId.value = data.record.id
    checkedMenuIds.value = []
    menuTree.value = []

    // 并行请求：菜单树 + 角色已有的菜单权限
    const [menus, roleDetail] = await Promise.all([
      MenuApi.tree(),
      RoleApi.detail(data.record.id).catch(() => null),
    ])

    menuTree.value = (menus || []).map(formatMenu)

    if (roleDetail?.menus) {
      checkedMenuIds.value = roleDetail.menus.map((m: any) => m.id)
    }
  }
})

function formatMenu(item: any): any {
  return {
    label: `${item.name} (${item.code})`,
    key: item.id,
    children: item.children ? item.children.map(formatMenu) : undefined,
  }
}

function onCheck(keys: any[]) {
  checkedMenuIds.value = keys
}

async function handleOk() {
  await RoleApi.assignMenu(roleId.value, checkedMenuIds.value)
  window.$message?.success?.('分配权限成功')
  closeModal()
  emit('success')
}
</script>

<template>
  <BasicModal
    title="分配菜单权限"
    :width="600"
    @register="registerModal"
    @ok="handleOk"
  >
    <n-tree
      :data="menuTree"
      :checked-keys="checkedMenuIds"
      checkable
      cascade
      default-expand-all
      @update:checked-keys="onCheck"
    />
  </BasicModal>
</template>
