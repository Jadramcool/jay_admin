<script setup lang="ts">
import { useRouter } from "vue-router";
import { NoticeApi } from "@/api/notice";
import { useNoticeSchema } from "./schema";

const router = useRouter();
const tableRef = ref<any>(null);

const schemaMethods = {
  handleDetail(row: any) {},
  handleEdit(row: any) {
    router.push(`/notice/notice/edit/${row.id}`);
  },
  handleDelete(row: any) {
    window.$dialog?.warning({
      title: "提示",
      content: `确定要删除公告「${row.title}」吗？`,
      positiveText: "确定",
      negativeText: "取消",
      onPositiveClick: async () => {
        await NoticeApi.delete(row.id);
        window.$message?.success?.("删除成功");
        reload();
      },
    });
  },
  async handleToggleStatus(row: any) {
    try {
      const action = row.status === 1 ? "下刊" : "发布";
      await NoticeApi.toggleStatus(row.id);
      window.$message?.success?.(`${action}成功`);
      reload();
    } catch {
      /* handled by interceptor */
    }
  },
  async handleTogglePin(row: any) {
    try {
      await NoticeApi.togglePin(row.id);
      window.$message?.success?.(row.isPinned ? "已取消置顶" : "已置顶");
      reload();
    } catch {
      /* handled by interceptor */
    }
  },
  async handleResend(row: any) {
    try {
      window.$dialog?.info({
        title: "重新推送",
        content: `确定要重新推送公告「${row.title}」至未读用户吗？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
          const result = await NoticeApi.resend(row.id);
          window.$message?.success?.(result.message || "重新推送成功");
          reload();
        },
      });
    } catch {
      /* handled by interceptor */
    }
  },
};

const { columns, formSchemas } = useNoticeSchema(schemaMethods);

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: "1 s:1 m:2 l:3 xl:4" },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
});

async function loadData(params: any) {
  const filters = getFieldsValue();
  return NoticeApi.list({ ...params, ...filters });
}

function reload() {
  tableRef.value?.reload();
}

function handleAdd() {
  router.push("/notice/notice/add");
}

async function handleBatchDelete(keys: number[]) {
  if (!keys || keys.length === 0) {
    window.$message?.warning?.("请先选择要删除的公告");
    return;
  }
  window.$dialog?.warning({
    title: "批量删除",
    content: `确定要删除选中的 ${keys.length} 条公告吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await NoticeApi.batchDelete(keys);
      window.$message?.success?.("批量删除成功");
      reload();
    },
  });
}
</script>

<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="公告管理"
      :columns="columns"
      :request="loadData"
      :row-key="(row: any) => row.id"
      :show-add-btn="true"
      @add="handleAdd"
      @batch-delete="handleBatchDelete" />
  </div>
</template>

