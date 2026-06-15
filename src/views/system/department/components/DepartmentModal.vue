<script setup lang="ts">
import { ref } from 'vue'
import { DepartmentApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { useDepartmentSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

const isUpdate = ref(false)
const { editFormSchemas } = useDepartmentSchema()

const [registerForm, { setFieldsValue, resetFields, validate, setProps: setFormProps }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const [registerModal, { closeModal }] = useModalInner(async (data: any) => {
  resetFields()
  isUpdate.value = !!data?.isUpdate
  if (isUpdate.value)
    setFieldsValue(data.record)
})

onMounted(() => {
  setFormProps({
    submitFunc: async () => {
      const values = await validate()
      if (isUpdate.value) {
        await DepartmentApi.update(values)
      }
      else {
        await DepartmentApi.create(values)
      }
      closeModal()
      emit('success')
    },
  })
})

function handleOk() {
  validate().then(() => {})
}
</script>

<template>
  <BasicModal
    :title="isUpdate ? '编辑部门' : '新增部门'"
    width="600"
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
