<script setup lang="ts">
import type { DepartmentModalData, DepartmentSaveResult } from '../types'
import type { DepartmentCreateParams, DepartmentUpdateParams } from '@/api/system/department'
import { shallowRef } from 'vue'
import { DepartmentApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { useDepartmentSchema } from '../schema'

const emit = defineEmits<{
  success: [result: DepartmentSaveResult]
  register: [instance: any, uuid: number]
}>()

const isUpdate = shallowRef(false)
const editingDepartmentId = shallowRef<number | null>(null)
const initialSnapshot = shallowRef('')
const saving = shallowRef(false)

function markUnavailableBranch(
  departments: System.Department[],
  branchDisabled = false,
): Array<System.Department & { disabled: boolean }> {
  return departments.map((department) => {
    const disabled = branchDisabled || department.id === editingDepartmentId.value
    return {
      ...department,
      disabled,
      children: department.children
        ? markUnavailableBranch(department.children, disabled)
        : undefined,
    }
  })
}

async function loadParentTree() {
  const departments = await DepartmentApi.tree()
  return markUnavailableBranch(departments ?? [])
}

const { editFormSchemas } = useDepartmentSchema({
  getEditingDepartmentId: () => editingDepartmentId.value,
  parentTreeApi: loadParentTree,
})

const [registerForm, { setFieldsValue, resetFields, validate, getFieldsValue }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data: DepartmentModalData) => {
  await resetFields()
  isUpdate.value = !!data?.isUpdate
  editingDepartmentId.value = isUpdate.value ? data.record?.id ?? null : null
  if (isUpdate.value) {
    await setFieldsValue(data.record ?? {})
  }
  else if (data?.record?.parentId) {
    await setFieldsValue({ parentId: data.record.parentId })
  }
  initialSnapshot.value = JSON.stringify(getFieldsValue())
})

function normalizeValues() {
  const values = getFieldsValue<DepartmentUpdateParams>()
  return {
    ...values,
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description?.trim() || undefined,
    parentId: values.parentId ?? null,
    sortOrder: values.sortOrder ?? 0,
    status: values.status ?? 1,
  }
}

async function handleOk() {
  try {
    await validate()
  }
  catch {
    return
  }
  saving.value = true
  setModalProps({ confirmLoading: true, loading: true })
  try {
    const values = normalizeValues()
    let savedDepartment: System.Department | undefined
    if (isUpdate.value) {
      savedDepartment = await DepartmentApi.update(values)
    }
    else {
      savedDepartment = await DepartmentApi.create(values as DepartmentCreateParams)
    }
    window.$message?.success?.(isUpdate.value ? '更新成功' : '创建成功')
    closeModal()
    emit('success', {
      departmentId: savedDepartment?.id ?? values.id ?? values.parentId ?? null,
      parentId: values.parentId ?? null,
      isUpdate: isUpdate.value,
    })
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    saving.value = false
    setModalProps({ confirmLoading: false, loading: false })
  }
}

async function handleBeforeClose() {
  if (saving.value)
    return false
  if (JSON.stringify(getFieldsValue()) === initialSnapshot.value)
    return true

  const dialog = window.$dialog
  if (!dialog)
    return true

  return new Promise<boolean>((resolve) => {
    dialog.warning({
      title: '放弃部门变更？',
      content: '当前表单尚未保存，关闭后将丢失已填写的内容。',
      positiveText: '放弃变更',
      negativeText: '继续编辑',
      onPositiveClick: () => resolve(true),
      onNegativeClick: () => resolve(false),
      onClose: () => resolve(false),
      onMaskClick: () => resolve(false),
    })
  })
}
</script>

<template>
  <BasicModal
    :title="isUpdate ? '编辑部门' : '新增部门'"
    :close-func="handleBeforeClose"
    width="min(680px, calc(100vw - 32px))"
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
