import dayjs from 'dayjs'
import { NButton, NPopconfirm, NSpace } from 'naive-ui'
import { computed } from 'vue'
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from '@/utils'

export function useRoleSchema(methods: any = {}) {
  const schema = computed(() => ({
    properties: [
      {
        table: { type: 'selection', options: ['all', 'none'] },
      },
      {
        key: 'id',
        label: 'ID',
        form: { component: 'NInputNumber', componentProps: { showButton: false, precision: 0 } },
        editForm: { componentProps: { disabled: true } },
      },
      {
        key: 'code',
        label: '角色编码',
        defaultValue: undefined,
        form: { component: 'NInput', componentProps: { placeholder: '请输入角色编码' } },
        editForm: {
          rules: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
          componentProps: { placeholder: '例如: admin' },
        },
      },
      {
        key: 'name',
        label: '角色名称',
        defaultValue: undefined,
        form: { component: 'NInput', componentProps: { placeholder: '请输入角色名称' } },
        editForm: {
          rules: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
          componentProps: { placeholder: '例如: 管理员' },
        },
      },
      {
        key: 'description',
        label: '描述',
        defaultValue: undefined,
        editForm: { component: 'NInput', componentProps: { type: 'textarea', placeholder: '请输入描述' } },
        table: { render: (row: any) => row.description || '-' },
      },
      {
        key: 'createdTime',
        label: '创建时间',
        table: {
          render: (row: any) => row.createdTime ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm') : '-',
        },
      },
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 240,
          render: (row: any) => (
            <NSpace justify="center">
              <NButton type="primary" ghost size="small" onClick={() => methods.handleAuth(row)}>
                分配菜单
              </NButton>
              <NButton type="primary" ghost size="small" onClick={() => methods.handleEdit(row)}>
                编辑
              </NButton>
              <NPopconfirm onPositiveClick={() => methods.handleDelete(row)}>
                {{
                  trigger: () => <NButton type="error" ghost size="small">删除</NButton>,
                  default: () => `确定删除角色 ${row.name}？`,
                }}
              </NPopconfirm>
            </NSpace>
          ),
        },
      },
    ],
    setting: { table: { resizable: true } },
  }))

  const tableFields = ['code', 'name', 'description', 'createdTime', 'operate']
  const formFields = ['code', 'name']
  const editFormFields = ['code', 'name', 'description']

  const columns = computed(() => columnsUtil(schema.value, tableFields))
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields))
  const editFormSchemas = computed(() => editFormSchemaUtil(schema.value, editFormFields))

  return { columns, formSchemas, editFormSchemas }
}
