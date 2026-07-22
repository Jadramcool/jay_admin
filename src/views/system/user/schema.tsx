import dayjs from 'dayjs'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'
import { RoleApi } from '@/api/system'
import { roleTypeOptions, sexOptions, statusOptions } from '@/constants'
import { columnsUtil, editFormSchemaUtil, formSchemaUtil, isPhone } from '@/utils'
import { hasPermission } from '@/utils/common/hasPermission'

export function useUserSchema(methods: any = {}) {
  const schema = computed(() => ({
    properties: [
      {
        table: { type: 'selection', options: ['all', 'none'], fixed: 'left' },
      },
      {
        key: 'id',
        label: 'ID',
        defaultValue: undefined,
        table: { width: 80 },
        form: {
          component: 'NInputNumber',
          componentProps: { showButton: false, min: 1, precision: 0 },
        },
        editForm: { componentProps: { disabled: true }, ifShow: false },
      },
      {
        key: 'username',
        label: '用户名',
        defaultValue: undefined,
        table: { width: 120, fixed: 'left' },
        form: {
          component: 'NInput',
          // query: "eq",
          componentProps: {
            placeholder: '请输入用户名',
          },
        },
        editForm: {
          rules: [
            {
              required: true,
              message: '请输入用户名',
              trigger: ['blur', 'input'],
            },
            {
              min: 3,
              max: 16,
              message: '用户名长度为3-16位',
              trigger: ['blur', 'input'],
            },
          ],
          componentProps: { maxlength: 16, showCount: true },
        },
      },
      {
        key: 'password',
        label: '密码',
        defaultValue: undefined,
        editForm: {
          ifShow: () => methods.isCreate === true,
          component: 'NInput',
          rules: [
            {
              required: true,
              message: '请输入密码',
              trigger: ['blur', 'input'],
            },
            {
              min: 6,
              max: 20,
              message: '密码长度为6-20位',
              trigger: ['blur', 'input'],
            },
          ],
          componentProps: {
            type: 'password',
            showPasswordOn: 'click',
            maxlength: 20,
            showCount: true,
            placeholder: '请输入密码',
          },
        },
      },
      {
        key: 'name',
        label: '姓名',
        defaultValue: undefined,
        form: {
          component: 'NInput',
          componentProps: {
            placeholder: '请输入姓名',
          },
        },
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: '请输入姓名' },
        },
        table: { width: 100, render: (row: any) => row.name || '-' },
      },
      {
        key: 'phone',
        label: '手机号',
        defaultValue: undefined,
        form: {
          component: 'NInput',
          query: 'eq',
          componentProps: {
            placeholder: '请输入手机号',
            allowInput: (value: string) => !value || /^\d+$/.test(value),
          },
          rules: [
            {
              validator: (rule: any, value: any) => {
                if (!value || isPhone(value))
                  return true
                return new Error('请输入正确的手机号')
              },
              trigger: 'blur',
            },
          ],
        },
        editForm: {
          component: 'NInput',
          componentProps: {
            placeholder: '请输入手机号',
            maxlength: 11,
            showCount: true,
            allowInput: (value: string) => !value || /^\d+$/.test(value),
          },
          rules: [
            {
              validator: (rule: any, value: any) => {
                if (isPhone(value))
                  return true
                return new Error('请输入正确的手机号')
              },
              trigger: ['blur', 'input'],
            },
          ],
        },
        table: { width: 130, render: (row: any) => row.phone || '-' },
      },
      {
        key: 'role',
        label: '角色',
        defaultValue: undefined,
        form: {
          component: 'ApiSelect',
          componentProps: {
            api: RoleApi.all,
            filterable: true,
            multiple: false,
            placeholder: '请选择角色',
            labelField: 'name',
            valueField: 'id',
          },
        },
        editForm: {
          key: 'roleIds',
          ifShow: () => methods.isCreate !== true,
          component: 'ApiSelect',
          componentProps: {
            api: RoleApi.all,
            filterable: true,
            multiple: true,
            placeholder: '请选择角色',
            labelField: 'name',
            valueField: 'id',
          },
        },
        table: {
          width: 180,
          render: (row: any) => {
            const roles = row.roles || []
            return (
              <NSpace justify="center">
                {roles.map((role: System.Role) => (
                  <NTag bordered={false} type="warning" size="small">
                    {role.name}
                  </NTag>
                ))}
              </NSpace>
            )
          },
        },
      },
      {
        key: 'roleType',
        label: '角色类型',
        defaultValue: undefined,
        form: {
          component: 'NSelect',
          componentProps: {
            placeholder: '请选择角色类型',
            options: roleTypeOptions,
          },
        },
        editForm: { componentProps: { disabled: true } },
        table: {
          width: 100,
          render: (row: any) => {
            const color = row.roleType === 'admin' ? 'primary' : 'info'
            const label
              = roleTypeOptions.find(o => o.value === row.roleType)?.label
                || row.roleType
            return (
              <NTag bordered={false} type={color as any} size="small">
                {label}
              </NTag>
            )
          },
        },
      },
      {
        key: 'sex',
        label: '性别',
        defaultValue: undefined,
        form: {
          component: 'NSelect',
          componentProps: {
            placeholder: '请选择性别',
            options: sexOptions,
          },
        },
        editForm: {
          component: 'NSelect',
          componentProps: { options: sexOptions },
        },
        table: {
          width: 80,
          render: (row: any) =>
            sexOptions.find(o => o.value === row.sex)?.label || '-',
        },
      },
      {
        key: 'status',
        label: '状态',
        defaultValue: undefined,
        form: {
          component: 'NSelect',
          componentProps: {
            options: statusOptions,
            placeholder: '请选择状态',
          },
        },
        editForm: {
          ifShow: () => methods.isCreate !== true,
          component: 'NRadioGroup',
          componentProps: { options: statusOptions },
        },
        table: {
          width: 80,
          render: (row: any) => {
            const s = statusOptions.find(o => o.value === row.status)
            const color = row.status === 1 ? 'success' : 'warning'
            return (
              <NTag bordered={false} type={color as any} size="small">
                {s?.label || '-'}
              </NTag>
            )
          },
        },
      },
      {
        key: 'createdTime',
        label: '创建时间',
        defaultValue: undefined,
        form: {
          component: 'NDatePicker',
          componentProps: {
            type: 'daterange',
            placeholder: '选择创建时间',
          },
        },
        table: {
          width: 170,
          render: (row: any) =>
            row.createdTime
              ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm:ss')
              : '-',
        },
      },
      {
        key: 'updatedTime',
        label: '更新时间',
        form: {
          component: 'NDatePicker',
          componentProps: {
            type: 'daterange',
            placeholder: '选择更新时间',
          },
        },
        table: {
          width: 170,
          render: (row: any) =>
            row.updatedTime
              ? dayjs(row.updatedTime).format('YYYY-MM-DD HH:mm:ss')
              : '-',
        },
      },
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 280,
          render: (row: any) => (
            <NSpace justify="center">
              {hasPermission('system:user:update') && (
                <NButton
                  type={row.status === 1 ? 'error' : 'primary'}
                  ghost
                  size="small"
                  onClick={() => methods.handleEnable(row)}
                >
                  {row.status === 0 ? '启用' : '禁用'}
                </NButton>
              )}
              {hasPermission('system:user:update') && (
                <NButton
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => methods.handleEdit(row)}
                >
                  编辑
                </NButton>
              )}
              {hasPermission('system:user:assign-role') && (
                <NButton
                  type="info"
                  ghost
                  size="small"
                  onClick={() => methods.handleAssignRole(row)}
                >
                  分配角色
                </NButton>
              )}
              {hasPermission('system:user:delete') && (
                <NPopconfirm onPositiveClick={() => methods.handleDelete(row)}>
                  {{
                    trigger: () => (
                      <NButton type="error" ghost size="small">
                        删除
                      </NButton>
                    ),
                    default: () => `是否确认删除用户 ${row.username}？`,
                  }}
                </NPopconfirm>
              )}
            </NSpace>
          ),
        },
      },
    ],
  }))

  const tableFields = [
    'username',
    'name',
    'phone',
    'role',
    'roleType',
    'sex',
    'status',
    'createdTime',
    'updatedTime',
    'operate',
  ]
  const formFields = [
    'username',
    'name',
    'phone',
    'role',
    'roleType',
    'sex',
    'status',
    'createdTime',
  ]
  const editFormFields = [
    'id',
    'username',
    'password',
    'name',
    'phone',
    'role',
    'sex',
    'status',
  ]

  const columns = computed(() => columnsUtil(schema.value, tableFields))
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields))
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema.value, editFormFields),
  )

  return { columns, formSchemas, editFormSchemas }
}
