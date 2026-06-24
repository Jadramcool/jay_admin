import { noticeTypeOptions } from "@/constants";
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from "@/utils";
import dayjs from "dayjs";
import { NButton, NPopconfirm, NSpace, NTag } from "naive-ui";
import { computed } from "vue";

export function useNoticeSchema(methods: any = {}) {
  const schema = computed(() => ({
    properties: [
      {
        table: { type: "selection", options: ["all", "none"] },
      },
      {
        key: "id",
        label: "ID",
        defaultValue: undefined,
        table: { width: 60 },
        editForm: { componentProps: { disabled: true }, ifShow: false },
      },
      {
        key: "title",
        label: "公告标题",
        defaultValue: undefined,
        form: {
          component: "NInput",
          componentProps: { placeholder: "请输入公告标题" },
        },
        table: {
          width: 200,
          ellipsis: { tooltip: true },
          render: (row: any) => (
            <a
              style="color: #2080f0; cursor: pointer; text-decoration: none;"
              onClick={() => methods.handleDetail(row)}>
              {row.title}
            </a>
          ),
        },
        editForm: {
          rules: [
            { required: true, message: "请输入公告标题", trigger: "blur" },
          ],
          componentProps: { placeholder: "请输入公告标题" },
        },
      },
      {
        key: "type",
        label: "公告类型",
        defaultValue: undefined,
        form: {
          component: "NSelect",
          componentProps: {
            options: noticeTypeOptions,
            placeholder: "请选择类型",
          },
        },
        editForm: {
          component: "NSelect",
          rules: [
            { required: true, message: "请选择公告类型", trigger: "change" },
          ],
          componentProps: {
            options: noticeTypeOptions,
            placeholder: "请选择类型",
          },
        },
        table: {
          width: 100,
          render: (row: any) => {
            const colorMap: Record<string, string> = {
              NOTICE: "info",
              INFO: "success",
              ACTIVITY: "warning",
            };
            const labelMap: Record<string, string> = {
              NOTICE: "通知",
              INFO: "资讯",
              ACTIVITY: "活动",
            };
            return (
              <NTag
                bordered={false}
                type={(colorMap[row.type] || "default") as any}
                size="small">
                {labelMap[row.type] || row.type}
              </NTag>
            );
          },
        },
      },
      {
        key: "status",
        label: "状态",
        defaultValue: undefined,
        form: {
          component: "NSelect",
          componentProps: {
            options: [
              { label: "草稿", value: 0 },
              { label: "已发布", value: 1 },
            ],
            placeholder: "请选择状态",
          },
        },
        table: {
          width: 90,
          render: (row: any) => {
            const color = row.status === 1 ? "success" : "default";
            return (
              <NTag bordered={false} type={color as any} size="small">
                {row.status === 1 ? "已发布" : "草稿"}
              </NTag>
            );
          },
        },
      },
      {
        key: "isPinned",
        label: "置顶",
        defaultValue: false,
        table: {
          width: 70,
          render: (row: any) => {
            if (!row.isPinned) return "-";
            return (
              <NTag bordered={false} type="error" size="small">
                置顶
              </NTag>
            );
          },
        },
      },
      {
        key: "readCount",
        label: "已读/总数",
        table: {
          width: 100,
          render: (row: any) => {
            if (row.totalReceivers == null) return "-";
            return `${row.readCount || 0}/${row.totalReceivers || 0}`;
          },
        },
      },
      {
        key: "authorName",
        label: "发布人",
        defaultValue: undefined,
        table: { width: 100 },
      },
      {
        key: "publishedAt",
        label: "发布时间",
        table: {
          width: 170,
          render: (row: any) =>
            row.publishedAt
              ? dayjs(row.publishedAt).format("YYYY-MM-DD HH:mm")
              : "-",
        },
      },
      {
        key: "createdTime",
        label: "创建时间",
        table: {
          width: 170,
          render: (row: any) =>
            row.createdTime
              ? dayjs(row.createdTime).format("YYYY-MM-DD HH:mm")
              : "-",
        },
      },
      {
        key: "operate",
        label: "操作",
        table: {
          fixed: "right",
          width: 320,
          render: (row: any) => (
            <NSpace justify="center" wrap>
              {row.status === 1 ? (
                <NButton
                  type="warning"
                  ghost
                  size="small"
                  onClick={() => methods.handleToggleStatus(row)}>
                  下刊
                </NButton>
              ) : (
                <NButton
                  type="success"
                  ghost
                  size="small"
                  onClick={() => methods.handleToggleStatus(row)}>
                  发布
                </NButton>
              )}
              <NButton
                type={row.isPinned ? "error" : "primary"}
                ghost
                size="small"
                onClick={() => methods.handleTogglePin(row)}>
                {row.isPinned ? "取消置顶" : "置顶"}
              </NButton>
              {row.status === 1 && (
                <NButton
                  ghost
                  size="small"
                  onClick={() => methods.handleResend(row)}>
                  重推
                </NButton>
              )}
              <NButton
                type="primary"
                ghost
                size="small"
                onClick={() => methods.handleEdit(row)}>
                编辑
              </NButton>
              <NPopconfirm onPositiveClick={() => methods.handleDelete(row)}>
                {{
                  trigger: () => (
                    <NButton type="error" ghost size="small">
                      删除
                    </NButton>
                  ),
                  default: () => `确定删除公告「${row.title}」吗？`,
                }}
              </NPopconfirm>
            </NSpace>
          ),
        },
      },
    ],
    setting: { table: { resizable: true } },
  }));

  const tableFields = [
    "title",
    "type",
    "status",
    "isPinned",
    "readCount",
    "authorName",
    "publishedAt",
    "createdTime",
    "operate",
  ];
  const formFields = ["title", "type", "status"];
  const editFormFields = ["title", "type", "scopeType"];

  const columns = computed(() => columnsUtil(schema.value, tableFields));
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields));
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema.value, editFormFields),
  );

  return { columns, formSchemas, editFormSchemas };
}

