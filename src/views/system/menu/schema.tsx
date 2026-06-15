import { MenuApi } from "@/api/system";
import { menuTypeOptions } from "@/constants";
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from "@/utils";
import { Icon } from "@iconify/vue/dist/iconify.js";
import dayjs from "dayjs";
import { NButton, NSpace, NTag } from "naive-ui";
import { computed } from "vue";

export const useMenuSchema = (methods: any = {}) => {
  const schema = computed(() => ({
    properties: [
      {
        key: "id",
        label: "ID",
        defaultValue: undefined,
        editForm: { ifShow: false },
      },
      {
        key: "type",
        label: "类型",
        defaultValue: "MENU",
        editForm: {
          component: "RadioButtonGroup",
          componentProps: { options: menuTypeOptions },
        },
        table: {
          render: (row: any) => {
            const map: Record<string, { label: string; color: string }> = {
              DIRECTORY: { label: "目录", color: "info" },
              MENU: { label: "菜单", color: "success" },
              BUTTON: { label: "按钮", color: "warning" },
            };
            const info = map[row.type];
            return info ? (
              <NTag bordered={false} type={info.color as any} size="small">
                {info.label}
              </NTag>
            ) : (
              "-"
            );
          },
        },
      },
      {
        key: "name",
        label: "名称",
        defaultValue: undefined,
        form: {
          component: "NInput",
          componentProps: { placeholder: "菜单名称" },
        },
        editForm: {
          rules: [
            { required: true, message: "请输入菜单名称", trigger: "blur" },
          ],
        },
      },
      {
        key: "code",
        label: "编码",
        defaultValue: undefined,
        form: {
          component: "NInput",
          componentProps: { placeholder: "编码" },
        },
        editForm: {
          rules: [{ required: true, message: "请输入编码", trigger: "blur" }],
          componentProps: { placeholder: "例如: system:user:list" },
        },
      },
      {
        key: "icon",
        label: "图标",
        ifShow: ({ values }: any) => values.type !== "BUTTON",
        editForm: { component: "IconPicker" },
        table: {
          render: (row: any) => (row.icon ? <Icon icon={row.icon} /> : "-"),
        },
      },
      {
        key: "path",
        label: "路由路径",
        ifShow: ({ values }: any) => values.type !== "BUTTON",
        editForm: {
          component: "NInput",
          rules: [
            { required: true, message: "请输入路由路径", trigger: "blur" },
          ],
          componentProps: { placeholder: "/system/user" },
        },
      },
      {
        key: "component",
        label: "组件路径",
        ifShow: ({ values }: any) => values.type === "MENU",
        editForm: {
          component: "NInput",
          componentProps: { placeholder: "/src/views/system/user/index.vue" },
        },
      },
      {
        key: "pid",
        label: "父级菜单",
        defaultValue: null,
        editForm: {
          component: "ApiTreeSelect",
          componentProps: {
            api: MenuApi.tree,
            placeholder: "请选择父菜单",
            labelField: "name",
            keyField: "id",
            clearable: true,
            filterable: true,
          },
        },
      },
      {
        key: "layout",
        label: "布局",
        ifShow: ({ values }: any) => values.type !== "BUTTON",
        editForm: {
          component: "NSelect",
          defaultValue: "normal",
          componentProps: {
            options: [
              { label: "默认布局", value: "normal" },
              { label: "空白布局", value: "empty" },
            ],
          },
        },
      },
      {
        key: "order",
        label: "排序",
        defaultValue: 0,
        editForm: {
          component: "NInputNumber",
          componentProps: { min: 0, precision: 0 },
        },
      },
      {
        key: "show",
        label: "显示",
        defaultValue: true,
        ifShow: ({ values }: any) => values.type !== "BUTTON",
        editForm: { component: "NSwitch" },
        table: {
          render: (row: any) => {
            const color = row.show ? "success" : "warning";
            return (
              <NTag bordered={false} type={color as any} size="small">
                {row.show ? "显示" : "隐藏"}
              </NTag>
            );
          },
        },
      },
      {
        key: "keepAlive",
        label: "缓存",
        defaultValue: false,
        ifShow: ({ values }: any) => values.type === "MENU",
        editForm: { component: "NSwitch" },
      },
      {
        key: "redirect",
        label: "重定向",
        ifShow: ({ values }: any) =>
          values.type === "MENU" || values.type === "DIRECTORY",
        editForm: {
          component: "NInput",
          giProps: { span: 2 },
          componentProps: { placeholder: "/default/home" },
        },
      },
      {
        key: "description",
        label: "描述",
        editForm: {
          component: "NInput",
          giProps: { span: 2 },
          componentProps: { type: "textarea" },
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
          width: 280,
          render: (row: any) => (
            <NSpace justify="center">
              {row.type !== "BUTTON" && (
                <NButton
                  type="info"
                  ghost
                  size="small"
                  onClick={() => methods.handleAddChild(row)}>
                  添加子菜单
                </NButton>
              )}
              <NButton
                type="primary"
                ghost
                size="small"
                onClick={() => methods.handleEdit(row)}>
                编辑
              </NButton>
              <NButton
                type="error"
                ghost
                size="small"
                onClick={() => methods.handleDelete(row)}>
                删除
              </NButton>
            </NSpace>
          ),
        },
      },
    ],
  }));

  const tableFields = [
    "type",
    "name",
    "code",
    "path",
    "icon",
    "order",
    "show",
    "createdTime",
    "operate",
  ];
  const formFields = ["name"];
  const editFormFields = [
    "id",
    "type",
    "pid",
    "name",
    "code",
    "icon",
    "path",
    "component",
    "layout",
    "redirect",
    "order",
    "show",
    "keepAlive",
    "description",
  ];

  const columns = computed(() => columnsUtil(schema.value, tableFields));
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields));
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema.value, editFormFields),
  );

  return { columns, formSchemas, editFormSchemas };
};

