<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="菜单管理"
      :columns="columns"
      :request="loadData"
      :row-key="(row: any) => row.id"
      :show-add-btn="true"
      :pagination="true"
      @add="handleAdd" />

    <MenuModal @register="registerModal" @success="reload" />
  </div>
</template>

<script setup lang="ts">
import { MenuApi } from "@/api/system";
import { useMenuSchema } from "./schema";
import MenuModal from "./components/MenuModal.vue";
import { useForm, useModal } from "@/components/index.ts";
import { arrayToTree } from "@/utils/common";

const tableRef = ref<any>(null);
const [registerModal, { openModal }] = useModal();

const schemaMethods = {
  handleEdit(row: any) {
    openModal({ record: row, isUpdate: true });
  },
  handleDelete(row: any) {
    window.$dialog?.warning({
      title: "提示",
      content: `确定要删除菜单「${row.name}」吗？`,
      positiveText: "确定",
      negativeText: "取消",
      onPositiveClick: async () => {
        try {
          await MenuApi.delete(row.id);
          window.$message?.success?.("删除成功");
          reload();
        } catch {
          /* handled by interceptor */
        }
      },
    });
  },
  handleAddChild(row: any) {
    openModal({ record: { pid: row.id }, isUpdate: false });
  },
};

const { columns, formSchemas } = useMenuSchema(schemaMethods);

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: "1 s:1 m:2 l:3 xl:4" },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
});

const loadData = async (params: any) => {
  const filters = getFieldsValue();
  const res = await MenuApi.list({ ...params, ...filters });
  const list = Array.isArray(res) ? res : (res?.list ?? []);
  return arrayToTree(list);
};

function reload() {
  tableRef.value?.reload();
}

function handleAdd() {
  openModal({ isUpdate: false });
}
</script>

