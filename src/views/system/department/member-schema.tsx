import { NTag } from 'naive-ui'
import { columnsUtil } from '@/utils'

export function useMemberSchema() {
  const schema = {
    properties: [
      {
        key: 'name',
        label: '姓名',
        table: {
          width: 120,
          render: (row: any) => row.name || row.username || '-',
        },
      },
      {
        key: 'username',
        label: '账号',
        table: { width: 130 },
      },
      {
        key: 'phone',
        label: '手机号',
        table: {
          width: 130,
          render: (row: any) => row.phone || '-',
        },
      },
      {
        key: 'position',
        label: '职位',
        table: {
          width: 120,
          render: (row: any) => row.position || '-',
        },
      },
      {
        key: 'roles',
        label: '角色',
        table: {
          render: (row: any) => {
            const roles = row.roles || []
            if (!roles.length)
              return '-'
            return roles.map((r: any) => r.name).join('、')
          },
        },
      },
      {
        key: 'status',
        label: '状态',
        table: {
          width: 80,
          render: (row: any) => {
            const color = row.status === 1 ? 'success' : 'warning'
            return (
              <NTag bordered={false} type={color as any} size="small">
                {row.status === 1 ? '启用' : '禁用'}
              </NTag>
            )
          },
        },
      },
    ],
  }

  const tableFields = ['name', 'username', 'phone', 'position', 'roles', 'status']
  const columns = columnsUtil(schema, tableFields)

  return { columns }
}
