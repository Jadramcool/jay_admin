import { DepartmentApi } from "@/api/system";
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from "@/utils";
import dayjs from "dayjs";
import { NButton, NPopconfirm, NSpace, NTag } from "naive-ui";
import { computed } from "vue";

export const useDepartmentSchema = (methods: any = {}) => {
  const schema = computed(() => ({
    properties: [
      {
        table: { type: "selection", options: ["all", "none"] },
      },
      {
        key: "id",
        label: "ID",
        defaultValue: undefined,
        editForm: { componentProps: { disabled: true } },
      },
      {
        key: "name",
        label: "部门名称",
        defaultValue: undefined,
        form: {
          component: "NInput",
          componentProps: { placeholder: "请输入部门名称" },
        },
        editForm: {
          rules: [
            { required: true, message: "请输入部门名称", trigger: "blur" },
          ],
          componentProps: { placeholder: "请输入部门名称" },
        },
      },
      {
        key: "code",
        label: "部门编码",
        defaultValue: undefined,
        form: {
          component: "NInput",
          componentProps: { placeholder: "请输入部门编码" },
        },
        editForm: {
          rules: [
            { required: true, message: "请输入部门编码", trigger: "blur" },
          ],
          componentProps: { placeholder: "例如: DEPT_IT" },
        },
      },
      {
        key: "level",
        label: "层级",
        defaultValue: 1,
        editForm: {
          component: "NInputNumber",
          componentProps: { min: 0, precision: 0 },
        },
        table: { width: 80 },
      },
      {
        key: "sortOrder",
        label: "排序",
        defaultValue: 0,
        editForm: {
          component: "NInputNumber",
          componentProps: { min: 0, precision: 0 },
        },
        table: { width: 80 },
      },
      {
        key: "description",
        label: "描述",
        defaultValue: undefined,
        editForm: {
          component: "NInput",
          componentProps: { type: "textarea", placeholder: "请输入描述" },
        },
        table: { render: (row: any) => row.description || "-" },
      },
      {
        key: "status",
        label: "状态",
        defaultValue: null,
        form: {
          component: "NSelect",
          componentProps: {
            options: [
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ],
            placeholder: "请选择状态",
          },
        },
        editForm: {
          component: "NRadioGroup",
          componentProps: {
            options: [
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ],
          },
        },
        table: {
          width: 80,
          render: (row: any) => {
            const color = row.status === 1 ? "success" : "warning";
            return (
              <NTag bordered={false} type={color as any} size="small">
                {row.status === 1 ? "启用" : "禁用"}
              </NTag>
            );
          },
        },
      },
      {
        key: "createdTime",
        label: "创建时间",
        table: {
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
          width: 240,
          render: (row: any) => (
            <NSpace justify="center">
              <NButton
                type={row.status === 1 ? "warning" : "success"}
                ghost
                size="small"
                onClick={() => methods.handleToggleStatus(row)}>
                {row.status === 1 ? "禁用" : "启用"}
              </NButton>
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
                  default: () => `确定删除部门 ${row.name}？`,
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
    "name",
    "code",
    "level",
    "sortOrder",
    "description",
    "status",
    "createdTime",
    "operate",
  ];
  const formFields = ["name", "code", "status"];
  const editFormFields = [
    "name",
    "code",
    "level",
    "sortOrder",
    "description",
    "status",
  ];

  const columns = computed(() => columnsUtil(schema.value, tableFields));
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields));
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema.value, editFormFields),
  );

  return { columns, formSchemas, editFormSchemas };
};

