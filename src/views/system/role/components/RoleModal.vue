<template>
  <BasicModal
    :title="isUpdate ? '编辑角色' : '新增角色'"
    @register="registerModal"
    @ok="handleOk"
    draggable>
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RoleApi } from "@/api/system";
import { useRoleSchema } from "../schema";
import { useModalInner } from "@/components/Modal/src/hooks/useModal";

const emit = defineEmits<{
  success: [];
  register: [instance: any, uuid: number];
}>();
const isUpdate = ref(false);
const { editFormSchemas } = useRoleSchema();

const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
  submitFunc: async () => {
    const values = await validate();
    if (isUpdate.value) {
      await RoleApi.update(values);
    } else {
      await RoleApi.create(values);
    }
    closeModal();
    emit("success");
  },
});

const [registerModal, { closeModal }] = useModalInner(async (data: any) => {
  resetFields();
  isUpdate.value = !!data?.isUpdate;
  if (isUpdate.value) setFieldsValue(data.record);
});

function handleOk() {
  validate().then(() => {});
}
</script>

