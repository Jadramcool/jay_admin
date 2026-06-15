<template>
  <BasicModal
    :title="isUpdate ? '编辑菜单' : '新增菜单'"
    @register="registerModal"
    @ok="handleOk">
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MenuApi } from "@/api/system";
import { useModalInner } from "@/components/Modal/src/hooks/useModal";
import { useForm } from "@/components/Form";
import { useMenuSchema } from "../schema";

const emit = defineEmits<{
  success: [];
  register: [instance: any, uuid: number];
}>();
const isUpdate = ref(false);
const editingId = ref<number | null>(null);

const { editFormSchemas } = useMenuSchema();

const [
  registerForm,
  { setFieldsValue, resetFields, validate, getFieldsValue },
] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
  gridProps: { cols: 2, "x-gap": 16 },
});

const [registerModal, { closeModal, setModalProps }] = useModalInner(
  (data: any) => {
    isUpdate.value = !!data?.isUpdate;
    resetFields();
    if (isUpdate.value) {
      editingId.value = data.record.id;
      setFieldsValue(data.record);
    } else if (data?.record?.pid) {
      editingId.value = null;
      setFieldsValue({ pid: data.record.pid });
    }
  },
);

async function handleOk() {
  try {
    await validate();
  } catch {
    return;
  }
  setModalProps({ loading: true });
  try {
    const values = {
      ...getFieldsValue(),
    };
    console.log("🚀 ~ handleOk ~ values:", values);
    if (isUpdate.value) {
      await MenuApi.update(values);
    } else {
      await MenuApi.create(values);
    }
    window.$message?.success?.(isUpdate.value ? "更新成功" : "创建成功");
    closeModal();
    emit("success");
  } finally {
    setModalProps({ loading: false });
  }
}
</script>

