import dayjs from 'dayjs'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from '@/utils'
import { hasPermission } from '@/utils/common/hasPermission'

export const configTypeOptions = [
  { label: '字符串', value: 'STRING' },
  { label: '数字', value: 'NUMBER' },
  { label: '布尔值', value: 'BOOLEAN' },
  { label: 'JSON', value: 'JSON' },
  { label: '数组', value: 'ARRAY' },
  { label: '文件', value: 'FILE' },
  { label: '邮箱', value: 'EMAIL' },
  { label: '链接', value: 'URL' },
  { label: '密码', value: 'PASSWORD' },
]

interface SysConfigSchemaMethods {
  handleDelete: (row: System.SysConfig) => void
  handleEdit: (row: System.SysConfig) => void
  handleTogglePublic: (row: System.SysConfig) => void
}

export function useSysConfigSchema(methods: SysConfigSchemaMethods) {
  const schema = computed(() => ({
    properties: [
      {
        table: {
          type: 'selection',
          options: ['all', 'none'],
          disabled: (row: System.SysConfig) => row.isSystem,
        },
      },
      {
        key: 'id',
        label: 'ID',
        editForm: { component: 'NInputNumber', ifShow: false },
      },
      {
        key: 'name',
        label: '配置名称',
        table: { width: 160, ellipsis: { tooltip: true } },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入配置名称' },
        },
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: '请输入配置名称' },
          rules: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
        },
      },
      {
        key: 'key',
        label: '配置键',
        table: { width: 190, ellipsis: { tooltip: true } },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入配置键' },
        },
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: '例如：site_name' },
          rules: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
        },
      },
      {
        key: 'value',
        label: '配置值',
        table: {
          width: 220,
          ellipsis: { tooltip: true },
          render: (row: System.SysConfig) =>
            row.type === 'PASSWORD' ? '••••••••' : row.value || '-',
        },
        editForm: {
          component: 'NInput',
          componentProps: { type: 'textarea', placeholder: '请输入配置值' },
          rules: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
        },
      },
      {
        key: 'type',
        label: '配置类型',
        defaultValue: 'STRING',
        table: {
          width: 100,
          render: (row: System.SysConfig) => {
            const label = configTypeOptions.find(option => option.value === row.type)?.label
            return <NTag size="small">{label || row.type || '-'}</NTag>
          },
        },
        form: {
          component: 'NSelect',
          componentProps: { options: configTypeOptions, placeholder: '请选择类型' },
        },
        editForm: {
          component: 'NSelect',
          componentProps: { options: configTypeOptions },
          rules: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
        },
      },
      {
        key: 'category',
        label: '分类',
        table: { width: 120 },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入分类' },
        },
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: '例如：system' },
        },
      },
      {
        key: 'description',
        label: '描述',
        table: { width: 220, ellipsis: { tooltip: true } },
        editForm: {
          component: 'NInput',
          componentProps: { type: 'textarea', placeholder: '请输入配置描述' },
        },
      },
      {
        key: 'isPublic',
        label: '公开配置',
        // 注意:属性级不设 defaultValue,否则会传导到查询表单导致默认只查「内部」
        table: {
          width: 100,
          render: (row: System.SysConfig) => (
            <NTag size="small" type={row.isPublic ? 'success' : 'default'}>
              {row.isPublic ? '公开' : '内部'}
            </NTag>
          ),
        },
        form: {
          component: 'NSelect',
          componentProps: {
            options: [
              { label: '全部', value: '' },
              { label: '公开', value: true },
              { label: '内部', value: false },
            ],
            placeholder: '请选择公开状态',
          },
        },
        editForm: { component: 'NSwitch', defaultValue: false },
      },
      {
        key: 'isSystem',
        label: '系统配置',
        defaultValue: false,
        table: {
          width: 100,
          render: (row: System.SysConfig) => (
            <NTag size="small" type={row.isSystem ? 'warning' : 'default'}>
              {row.isSystem ? '系统' : '业务'}
            </NTag>
          ),
        },
        editForm: { component: 'NSwitch' },
      },
      {
        key: 'sortOrder',
        label: '排序',
        defaultValue: 0,
        table: { width: 80 },
        editForm: {
          component: 'NInputNumber',
          componentProps: { min: 0, precision: 0 },
        },
      },
      {
        key: 'updatedTime',
        label: '更新时间',
        table: {
          width: 170,
          render: (row: System.SysConfig) =>
            row.updatedTime
              ? dayjs(row.updatedTime).format('YYYY-MM-DD HH:mm')
              : '-',
        },
      },
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 250,
          render: (row: System.SysConfig) => (
            <NSpace justify="center">
              {hasPermission('system:config:update') && (
                <NButton
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => methods.handleTogglePublic(row)}
                >
                  {row.isPublic ? '设为内部' : '设为公开'}
                </NButton>
              )}
              {hasPermission('system:config:update') && (
                <NButton
                  type="info"
                  ghost
                  size="small"
                  onClick={() => methods.handleEdit(row)}
                >
                  编辑
                </NButton>
              )}
              {hasPermission('system:config:delete') && !row.isSystem && (
                <NPopconfirm onPositiveClick={() => methods.handleDelete(row)}>
                  {{
                    trigger: () => (
                      <NButton type="error" ghost size="small">
                        删除
                      </NButton>
                    ),
                    default: () => `确定删除配置 ${row.name}？`,
                  }}
                </NPopconfirm>
              )}
            </NSpace>
          ),
        },
      },
    ],
    setting: { table: { resizable: true } },
  }))

  const tableFields = [
    'name',
    'key',
    'value',
    'type',
    'category',
    'isPublic',
    'isSystem',
    'sortOrder',
    'updatedTime',
    'operate',
  ]
  const formFields = ['name', 'key', 'type', 'category', 'isPublic']
  const editFormFields = [
    'id',
    'name',
    'key',
    'value',
    'type',
    'category',
    'description',
    'isPublic',
    'isSystem',
    'sortOrder',
  ]

  return {
    columns: computed(() => columnsUtil(schema.value, tableFields)),
    editFormSchemas: computed(() => editFormSchemaUtil(schema.value, editFormFields)),
    formSchemas: computed(() => formSchemaUtil(schema.value, formFields)),
  }
}
