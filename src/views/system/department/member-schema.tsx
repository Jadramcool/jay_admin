import type { DataTableColumns } from 'naive-ui'
import { NTag } from 'naive-ui'

export function useMemberSchema() {
  const columns: DataTableColumns<System.User> = [
    {
      key: 'name',
      title: '姓名',
      align: 'center',
      width: 120,
      ellipsis: { tooltip: true },
      render: row => row.name || row.username || '-',
    },
    {
      key: 'username',
      title: '账号',
      align: 'center',
      width: 140,
      ellipsis: { tooltip: true },
    },
    {
      key: 'phone',
      title: '手机号',
      align: 'center',
      width: 130,
      render: row => row.phone || '-',
    },
    {
      key: 'position',
      title: '职位',
      width: 140,
      align: 'center',
      ellipsis: { tooltip: true },
      render: row => row.position || '-',
    },
    {
      key: 'roles',
      title: '角色',
      width: 220,
      ellipsis: { tooltip: true },
      align: 'center',
      render: (row) => {
        if (!row.roles.length)
          return '-'
        return row.roles.map(role => role.name).join('、')
      },
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      align: 'center',
      render: row => (
        <NTag
          bordered={false}
          type={row.status === 1 ? 'success' : 'warning'}
          size="small"
        >
          {row.status === 1 ? '启用' : '禁用'}
        </NTag>
      ),
    },
  ]

  return { columns }
}
