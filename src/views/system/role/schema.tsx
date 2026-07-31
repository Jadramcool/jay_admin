import dayjs from 'dayjs'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from '@/utils'
import { hasPermission } from '@/utils/common/hasPermission'
import { isSystemAdminRole } from './roleRules'

export function useRoleSchema(methods: any = {}) {
  const schema = computed(() => ({
    properties: [
      {
        table: {
          type: 'selection',
          options: ['all', 'none'],
          disabled: (row: System.Role) => isSystemAdminRole(row),
        },
      },
      {
        key: 'id',
        label: 'ID',
        form: {
          component: 'NInputNumber',
          componentProps: { showButton: false, precision: 0 },
        },
        editForm: { componentProps: { disabled: true }, ifShow: false },
      },
      {
        key: 'code',
        label: '角色编码',
        defaultValue: undefined,
        table: {
          width: 160,
          ellipsis: { tooltip: true },
        },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入角色编码' },
        },
        editForm: {
          rules: [
            { required: true, message: '请输入角色编码', trigger: 'blur' },
          ],
          componentProps: { placeholder: '例如: admin' },
        },
      },
      {
        key: 'name',
        label: '角色名称',
        defaultValue: undefined,
        table: {
          width: 160,
          ellipsis: { tooltip: true },
        },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入角色名称' },
        },
        editForm: {
          rules: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
          ],
          componentProps: { placeholder: '例如: 管理员' },
        },
      },
      {
        key: 'description',
        label: '描述',
        defaultValue: undefined,
        editForm: {
          component: 'NInput',
          componentProps: { type: 'textarea', placeholder: '请输入描述' },
        },
        table: {
          width: 260,
          ellipsis: { tooltip: true },
          render: (row: any) => row.description || '-',
        },
      },
      {
        key: 'createdTime',
        label: '创建时间',
        table: {
          width: 170,
          render: (row: any) =>
            row.createdTime
              ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm')
              : '-',
        },
      },
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 280,
          render: (row: System.Role) => {
            if (isSystemAdminRole(row)) {
              return (
                <NTag size="small" round>
                  系统管理员 · 不可编辑
                </NTag>
              )
            }

            return (
              <NSpace justify="center">
                {hasPermission('system:role:assign-menu') && (
                  <NButton
                    type="primary"
                    ghost
                    size="small"
                    onClick={() => methods.handleAuth(row)}
                  >
                    分配菜单权限
                  </NButton>
                )}
                {hasPermission('system:role:update') && (
                  <NButton
                    type="info"
                    ghost
                    size="small"
                    onClick={() => methods.handleEdit(row)}
                  >
                    编辑
                  </NButton>
                )}
                {hasPermission('system:role:delete') && (
                  <NPopconfirm
                    onPositiveClick={() => methods.handleDelete(row)}
                  >
                    {{
                      trigger: () => (
                        <NButton type="error" ghost size="small">
                          删除
                        </NButton>
                      ),
                      default: () => `确定删除角色 ${row.name}？`,
                    }}
                  </NPopconfirm>
                )}
              </NSpace>
            )
          },
        },
      },
    ],
    setting: { table: { resizable: true } },
  }))

  const tableFields = ['code', 'name', 'description', 'createdTime', 'operate']
  const formFields = ['code', 'name']
  const editFormFields = ['id', 'code', 'name', 'description']

  const columns = computed(() => columnsUtil(schema.value, tableFields))
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields))
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema.value, editFormFields),
  )

  return { columns, formSchemas, editFormSchemas }
}
