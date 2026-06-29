import dayjs from 'dayjs'
import { NTag } from 'naive-ui'
import { h } from 'vue'
import { roleTypeOptions, sexOptions, statusOptions } from '@/constants'

export function useUserDetailSchema() {
  function getSexLabel(value: string | null | undefined) {
    return sexOptions.find((o: any) => o.value === value)?.label || value || '-'
  }

  function getRoleTypeLabel(value: string | null | undefined) {
    return roleTypeOptions.find((o: any) => o.value === value)?.label || value || '-'
  }

  function getStatusLabel(value: number | null | undefined) {
    return statusOptions.find((o: any) => o.value === value)?.label || value || '-'
  }

  function getStatusColor(value: number | null | undefined) {
    return value === 1 ? 'success' : 'warning'
  }

  const basicSchemas = [
    { field: 'username', label: '用户名', render: (data: any) => data.username || '-' },
    { field: 'name', label: '姓名', render: (data: any) => data.name || '-' },
    { field: 'sex', label: '性别', render: (data: any) => getSexLabel(data.sex) },
    {
      field: 'status',
      label: '状态',
      render: (data: any) =>
        h(NTag, { bordered: false, type: getStatusColor(data.status) as any, size: 'small' }, { default: () => getStatusLabel(data.status) }),
    },
    { field: 'phone', label: '手机号', render: (data: any) => data.phone || '-' },
    { field: 'email', label: '邮箱', render: (data: any) => data.email || '-' },
    { field: 'position', label: '职位', render: (data: any) => data.position || '-' },
    {
      field: 'roleType',
      label: '角色类型',
      render: (data: any) => h(NTag, { bordered: false, size: 'small' }, { default: () => getRoleTypeLabel(data.roleType) }),
    },
    {
      field: 'roles',
      label: '角色',
      render: (data: any) =>
        data.roles?.length
          ? data.roles.map((r: any) =>
              h(NTag, { bordered: false, type: 'warning' as any, size: 'small', style: 'margin-right:4px;margin-bottom:4px' }, { default: () => r.name }),
            )
          : '-',
    },
    { field: 'departmentName', label: '所属部门', render: (data: any) => data.departmentName || '-' },
  ]

  const otherSchemas = [
    { field: 'birthday', label: '生日', render: (data: any) => (data.birthday ? dayjs(data.birthday).format('YYYY-MM-DD') : '-') },
    { field: 'joinedAt', label: '入职时间', render: (data: any) => (data.joinedAt ? dayjs(data.joinedAt).format('YYYY-MM-DD') : '-') },
    { field: 'city', label: '城市', render: (data: any) => data.city || '-' },
    { field: 'address', label: '地址', render: (data: any) => data.address || '-' },
    { field: 'addressDetail', label: '详细地址', span: 2, render: (data: any) => data.addressDetail || '-' },
  ]

  return { basicSchemas, otherSchemas, getSexLabel, getRoleTypeLabel, getStatusLabel, getStatusColor }
}
