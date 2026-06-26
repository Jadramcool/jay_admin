<script setup lang="ts">
import { NoticeApi } from "@/api/notice";
import { BasicModal, useModal, useModalInner } from "@/components/Modal";
import dayjs from "dayjs";
import { NButton, NRadioButton, NRadioGroup, NTag } from "naive-ui";
import { h, nextTick, ref } from "vue";

defineEmits<{
  register: [instance: any, uuid: number];
}>();

const tableRef = ref<any>(null);
const noticeId = ref<number>(0);
const noticeTitle = ref("");
type StatusFilter = "unread" | "read" | "all";
const statusFilter = ref<StatusFilter>("unread");

// 用户详情弹窗
const [registerUserModal, { openModal: openUserDetail }] = useModal();
const selectedUser = ref<any>({});

const [register] = useModalInner(async (data) => {
  noticeId.value = data?.id || 0;
  noticeTitle.value = data?.title || "";
  statusFilter.value = "unread";
  await nextTick();
  tableRef.value?.reload();
});

async function loadReceivers(params: any) {
  if (!noticeId.value) return { list: [], pagination: { total: 0 } };
  const filterParam =
    statusFilter.value === "all" ? undefined : statusFilter.value;
  const data = await NoticeApi.getReceivers(
    noticeId.value,
    filterParam,
    params.page,
    params.pageSize,
  );
  return {
    list: (data as any)?.list || [],
    pagination: (data as any)?.pagination || { total: 0 },
  };
}

function filterByStatus(status: StatusFilter) {
  statusFilter.value = status;
  tableRef.value?.reload();
}

function formatDateTime(dt: string | null | undefined) {
  return dt ? dayjs(dt).format("YYYY-MM-DD HH:mm:ss") : "-";
}

function showUserDetail(row: any) {
  selectedUser.value = {
    id: row.userId,
    username: row.username,
    name: row.name,
    phone: row.phone,
    email: row.email,
    sex: row.sex,
    roleType: row.roleType,
    position: row.position,
    status: row.status,
    departmentName: row.departmentName,
    roles: row.roles,
  };
  openUserDetail();
}

const columns = [
  { title: "用户名", key: "username", width: 120 },
  {
    title: "姓名",
    key: "name",
    width: 100,
    render: (row: any) => row.name || "-",
  },
  {
    title: "部门",
    key: "departmentName",
    width: 120,
    render: (row: any) => row.departmentName || "-",
  },
  {
    title: "角色",
    key: "roles",
    width: 160,
    render: (row: any) => {
      if (!row.roles || row.roles.length === 0) return "-";
      return row.roles.map((r: any) =>
        h(
          NTag,
          {
            bordered: false,
            type: "warning" as any,
            size: "small",
            style: "margin-right:4px",
          },
          { default: () => r.name },
        ),
      );
    },
  },
  {
    title: "手机号",
    key: "phone",
    width: 130,
    render: (row: any) => row.phone || "-",
  },
  {
    title: "是否已读",
    key: "readTime",
    width: 90,
    render: (row: any) =>
      row.readTime
        ? h(
            NTag,
            { bordered: false, type: "success" as any, size: "small" },
            { default: () => "已读" },
          )
        : h(
            NTag,
            { bordered: false, type: "error" as any, size: "small" },
            { default: () => "未读" },
          ),
  },
  {
    title: "阅读时间",
    key: "readTime",
    width: 170,
    render: (row: any) => (row.readTime ? formatDateTime(row.readTime) : "-"),
  },
  {
    title: "分配时间",
    key: "assignedTime",
    width: 170,
    render: (row: any) => formatDateTime(row.assignedTime),
  },
  {
    title: "操作",
    key: "actions",
    width: 100,
    fixed: "right",
    render: (row: any) =>
      h(
        NButton,
        {
          size: "small",
          type: "primary",
          ghost: true,
          onClick: () => showUserDetail(row),
        },
        { default: () => "详情" },
      ),
  },
];
</script>

<template>
  <BasicModal
    :title="`接收人列表 - ${noticeTitle}`"
    :width="1000"
    :auto-focus="false"
    @register="register">
    <n-radio-group
      style="margin-bottom: 12px"
      :value="statusFilter"
      @update:value="filterByStatus">
      <n-radio-button value="unread">未读</n-radio-button>
      <n-radio-button value="read">已读</n-radio-button>
      <n-radio-button value="all">全部</n-radio-button>
    </n-radio-group>

    <BasicTable
      ref="tableRef"
      :columns="columns"
      :request="loadReceivers"
      :show-toolbar="false"
      :scroll-x="1100"
      :row-key="(row: any) => row.userId" />

    <UserDetail @register="registerUserModal" />
  </BasicModal>
</template>

