import dayjs from 'dayjs'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'
import { methodOptions, operationStatusOptions, operationTypeOptions } from '@/constants'
import { columnsUtil, formSchemaUtil } from '@/utils'

export function useOperationLogSchema(methods: any = {}) {
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
      },
      {
        key: 'username',
        label: '操作人',
        defaultValue: undefined,
        table: { width: 100 },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入操作人' },
        },
      },
      {
        key: 'operationType',
        label: '操作类型',
        defaultValue: undefined,
        table: {
          width: 100,
          render: (row: any) => {
            const s = operationTypeOptions.find(o => o.value === row.operationType)
            const colorMap: Record<string, string> = {
              CREATE: 'success',
              UPDATE: 'info',
              DELETE: 'error',
              VIEW: 'default',
              LOGIN: 'primary',
              LOGOUT: 'warning',
              EXPORT: 'info',
              IMPORT: 'info',
            }
            const color = colorMap[row.operationType] || 'default'
            return (
              <NTag bordered={false} type={color as any} size="small">
                {s?.label || row.operationType || '-'}
              </NTag>
            )
          },
        },
        form: {
          component: 'NSelect',
          componentProps: {
            options: operationTypeOptions,
            placeholder: '请选择操作类型',
          },
        },
      },
      {
        key: 'module',
        label: '操作模块',
        defaultValue: undefined,
        table: { width: 120, render: (row: any) => row.module || '-' },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入模块名称' },
        },
      },
      {
        key: 'method',
        label: '请求方法',
        defaultValue: undefined,
        table: {
          width: 100,
          render: (row: any) => {
            const colorMap: Record<string, string> = {
              GET: 'success',
              POST: 'info',
              PUT: 'warning',
              DELETE: 'error',
            }
            const color = colorMap[row.method] || 'default'
            return (
              <NTag bordered={false} type={color as any} size="small">
                {row.method || '-'}
              </NTag>
            )
          },
        },
        form: {
          component: 'NSelect',
          componentProps: {
            options: methodOptions,
            placeholder: '请选择请求方法',
          },
        },
      },
      {
        key: 'description',
        label: '操作描述',
        defaultValue: undefined,
        table: {
          width: 200,
          ellipsis: { tooltip: true },
          render: (row: any) => row.description || '-',
        },
      },
      {
        key: 'url',
        label: '请求路径',
        defaultValue: undefined,
        table: {
          width: 200,
          ellipsis: { tooltip: true },
          render: (row: any) => row.url || '-',
        },
      },
      {
        key: 'status',
        label: '状态',
        defaultValue: undefined,
        table: {
          width: 80,
          render: (row: any) => {
            const s = operationStatusOptions.find(o => o.value === row.status)
            const color = row.status === 'SUCCESS' ? 'success' : row.status === 'FAILED' ? 'error' : 'warning'
            return (
              <NTag bordered={false} type={color as any} size="small">
                {s?.label || row.status || '-'}
              </NTag>
            )
          },
        },
        form: {
          component: 'NSelect',
          componentProps: {
            options: operationStatusOptions,
            placeholder: '请选择状态',
          },
        },
      },
      {
        key: 'ipAddress',
        label: 'IP地址',
        defaultValue: undefined,
        table: { width: 130, render: (row: any) => row.ipAddress || '-' },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '请输入IP地址' },
        },
      },
      {
        key: 'duration',
        label: '耗时',
        defaultValue: undefined,
        table: {
          width: 90,
          render: (row: any) => {
            if (row.duration == null)
              return '-'
            return row.duration >= 1000 ? `${(row.duration / 1000).toFixed(2)}s` : `${row.duration}ms`
          },
        },
      },
      {
        key: 'createdTime',
        label: '操作时间',
        defaultValue: undefined,
        table: {
          width: 170,
          render: (row: any) =>
            row.createdTime
              ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm:ss')
              : '-',
        },
        form: {
          component: 'NDatePicker',
          componentProps: {
            type: 'daterange',
            placeholder: '选择操作时间',
          },
        },
      },
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 160,
          render: (row: any) => (
            <NSpace justify="center">
              <NButton
                type="primary"
                ghost
                size="small"
                onClick={() => methods.handleDetail(row)}
              >
                详情
              </NButton>
              <NPopconfirm onPositiveClick={() => methods.handleDelete(row)}>
                {{
                  trigger: () => (
                    <NButton type="error" ghost size="small">
                      删除
                    </NButton>
                  ),
                  default: () => '确定要删除该日志吗？',
                }}
              </NPopconfirm>
            </NSpace>
          ),
        },
      },
    ],
  }))

  const tableFields = [
    'username',
    'operationType',
    'module',
    'method',
    'description',
    'url',
    'status',
    'ipAddress',
    'duration',
    'createdTime',
    'operate',
  ]
  const formFields = [
    'username',
    'operationType',
    'module',
    'method',
    'status',
    'ipAddress',
    'createdTime',
  ]

  const columns = computed(() => columnsUtil(schema.value, tableFields))
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields))

  return { columns, formSchemas }
}
