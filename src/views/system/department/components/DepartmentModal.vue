<template>
  <BasicModal
    :title="isUpdate ? '编辑部门' : '新增部门'"
    @register="registerModal"
    @ok="handleOk"
    width="600">
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DepartmentApi } from '@/api/system';
import { useDepartmentSchema } from '../schema';
import { useModalInner } from '@/components/Modal/src/hooks/useModal';

const emit = defineEmits<{
  success: [];
  register: [instance: any, uuid: number];
}>();

const isUpdate = ref(false);
const { editFormSchemas } = useDepartmentSchema();

const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
  submitFunc: async () => {
    const values = await validate();
    if (isUpdate.value) {
      await DepartmentApi.update(values);
    } else {
      await DepartmentApi.create(values);
    }
    closeModal();
    emit('success');
  },
});

const [registerModal, { closeModal }] = useModalInner(async (data: any) => {
  resetFields();
  isUpdate.value = !!data?.isUpdate;
  if (isUpdate.value) setFieldsValue(data.record);
});

function handleOk() { validate().then(() => {}); }
</script>
