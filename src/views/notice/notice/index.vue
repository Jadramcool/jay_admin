<script setup lang="ts">
import { NoticeApi } from "@/api/notice";
import { useModal } from "@/components/Modal";
import { useRouter } from "vue-router";
import NoticeDetailModal from "./components/NoticeDetailModal.vue";
import NoticeReceiversModal from "./components/NoticeReceiversModal.vue";
import { useNoticeSchema } from "./schema.tsx";

const router = useRouter();
const tableRef = ref<any>(null);

const [registerReceiversModal, { openModal: openReceiversModal }] = useModal();
const [registerDetailModal, { openModal: openDetailModal }] = useModal();

const schemaMethods = {
  handleDetail(row: any) {
    openDetailModal({ record: row });
  },
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
        try {
          await NoticeApi.delete(row.id);
          window.$message?.success?.("删除成功");
          reload();
        } catch {
          /* handled by interceptor */
        }
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
        content: `确定要重新推送公告「${row.title}」至所有目标用户吗？`,
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
  handleViewReceivers(row: any) {
    openReceiversModal({ id: row.id, title: row.title });
  },
};

const { columns, formSchemas } = useNoticeSchema(schemaMethods);

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: "1 s:1 m:2 l:3 xl:4" },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
});

interface LoadParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

async function loadData(params: LoadParams) {
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
        try {
          await NoticeApi.batchDelete(keys);
          window.$message?.success?.("批量删除成功");
          reload();
        } catch {
          /* handled by interceptor */
        }
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
      :scroll-x="1550"
      @add="handleAdd"
      @batch-delete="handleBatchDelete" />
    <NoticeReceiversModal @register="registerReceiversModal" />
    <NoticeDetailModal @register="registerDetailModal" />
  </div>
</template>

