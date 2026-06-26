import { noticeTypeOptions } from "@/constants";
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from "@/utils";
import dayjs from "dayjs";
import { NButton, NPopconfirm, NSpace, NTag } from "naive-ui";
import { computed } from "vue";



/**
 * 公告详情弹窗的 Descriptions 配置
 */
export function useNoticeDetailSchema() {
  function getTypeLabel(value: string | null | undefined) {
    return (
      noticeTypeOptions.find((o: any) => o.value === value)?.label ||
      value ||
      "-"
    );
  }

  function getTypeColor(value: string | null | undefined) {
    const map: Record<string, string> = {
      NOTICE: "info",
      INFO: "success",
      ACTIVITY: "warning",
    };
    return map[value || ""] || "default";
  }

  function formatDateTime(dt: string | null | undefined) {
    return dt ? dayjs(dt).format("YYYY-MM-DD HH:mm:ss") : "-";
  }

  const basicSchemas = [
    {
      field: "title",
      label: "公告标题",
      span: 2,
      labelBold: true,
      valueBold: true,
      render: (data: any) => data.title || "-",
    },
    {
      field: "type",
      label: "公告类型",
      render: (data: any) => (
        <NTag
          bordered={false}
          type={getTypeColor(data.type) as any}
          size="small">
          {getTypeLabel(data.type)}
        </NTag>
      ),
    },
    {
      field: "status",
      label: "发布状态",
      render: (data: any) => (
        <NTag
          bordered={false}
          type={data.status === 1 ? "success" : ("default" as any)}
          size="small">
          {data.status === 1 ? "已发布" : "草稿"}
        </NTag>
      ),
    },
    {
      field: "authorName",
      label: "发布人",
      render: (data: any) => data.authorName || "-",
    },
    {
      field: "publishedAt",
      label: "发布时间",
      render: (data: any) => formatDateTime(data.publishedAt),
    },
    {
      field: "createdTime",
      label: "创建时间",
      render: (data: any) => formatDateTime(data.createdTime),
    },
    {
      field: "updatedTime",
      label: "更新时间",
      render: (data: any) => formatDateTime(data.updatedTime),
    },
    {
      field: "isPinned",
      label: "置顶",
      render: (data: any) =>
        data.isPinned ? (
          <NTag bordered={false} type="error" size="small">
            置顶
          </NTag>
        ) : (
          "-"
        ),
    },
    {
      field: "isMandatory",
      label: "强制阅读",
      render: (data: any) =>
        data.isMandatory ? (
          <NTag bordered={false} type="warning" size="small">
            强制
          </NTag>
        ) : (
          "-"
        ),
    },
    {
      field: "scopeType",
      label: "发布范围",
      render: (data: any) => {
        const label =
          data.scopeType === "ALL"
            ? "全部用户"
            : data.scopeType === "ROLE"
              ? "按角色"
              : data.scopeType === "DEPARTMENT"
                ? "按部门"
                : data.scopeType === "USER"
                  ? "指定用户"
                  : data.scopeType || "-";
        return (
          <NTag bordered={false} size="small">
            {label}
          </NTag>
        );
      },
    },
    {
      field: "readCount",
      label: "已读 / 总数",
      render: (data: any) =>
        `${data.readCount ?? "-"} / ${data.totalReceivers ?? "-"}`,
    },
  ];

  return { basicSchemas, getTypeLabel, getTypeColor, formatDateTime };
}

export function useNoticeSchema(methods: any = {}) {
  const schema = {
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
          component: "NInput" as const,
          rules: [
            {
              required: true,
              message: "请输入公告标题",
              trigger: ["blur", "input"],
            },
          ],
          componentProps: {
            placeholder: "请输入公告标题",
            maxlength: 100,
            showCount: true,
          },
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
        editForm: {
          component: "NSwitch" as const,
        },
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
        key: "isMandatory",
        label: "强制阅读",
        defaultValue: false,
        editForm: {
          component: "NSwitch" as const,
        },
      },
      {
        key: "scopeType",
        label: "发布范围",
        defaultValue: "ALL",
        editForm: {
          slot: "scopeType",
        },
      },
      {
        key: "scopeTargets",
        label: "范围目标",
        ifShow: ({ values }: any) => values.scopeType !== "ALL",
        editForm: {
          slot: "scopeTargets",
        },
      },
      {
        key: "content",
        label: "公告内容",
        defaultValue: "",
        editForm: {
          slot: "content",
          giProps: { span: 2 },
        },
      },
      {
        key: "readCount",
        label: "已读/总数",
        table: {
          width: 100,
          render: (row: any) => {
            if (row.totalReceivers == null) return "-";
            return (
              <NButton
                text
                type="info"
                size="small"
                onClick={() => methods.handleViewReceivers?.(row)}>
                {row.readCount || 0}/{row.totalReceivers || 0}
              </NButton>
            );
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
        key: "code",
        label: "编码",
        table: { width: 120 },
      },
      {
        key: "name",
        label: "名称",
        table: { width: 120 },
      },
      {
        key: "username",
        label: "用户名",
        table: { width: 120 },
      },
      {
        key: "operate",
        label: "操作",
        table: {
          fixed: "right",
          width: 300,
          render: (row: any) => (
            <NSpace justify="center" wrap>
              {(() => {
                const isPublished = row.status === 1;
                return (
                  <NButton
                    type={isPublished ? "warning" : "success"}
                    ghost
                    size="small"
                    onClick={() => methods.handleToggleStatus(row)}>
                    {isPublished ? "下刊" : "发布"}
                  </NButton>
                );
              })()}
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
    setting: {},
  };

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
  const editFormFields = [
    "title",
    "type",
    "scopeType",
    "scopeTargets",
    "isPinned",
    "isMandatory",
    "content",
  ];

  const columns = computed(() => columnsUtil(schema, tableFields));
  const formSchemas = computed(() => formSchemaUtil(schema, formFields));
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema, editFormFields),
  );

  function renameTitle(cols: any[], map: Record<string, string>) {
    return cols.map((c: any) => ({ ...c, title: map[c.key] || c.title }));
  }

  const roleColumns = computed(() =>
    renameTitle(columnsUtil(schema, ["code", "name"]), {
      code: "角色编码",
      name: "角色名称",
    }),
  );

  const departmentColumns = computed(() =>
    renameTitle(columnsUtil(schema, ["name", "code"]), {
      name: "姓名",
      code: "部门编码",
    }),
  );

  const userColumns = computed(() =>
    renameTitle(columnsUtil(schema, ["name", "username"]), {
      name: "姓名",
      username: "用户名",
    }),
  );

  return {
    columns,
    formSchemas,
    editFormSchemas,
    roleColumns,
    departmentColumns,
    userColumns,
  };
}

