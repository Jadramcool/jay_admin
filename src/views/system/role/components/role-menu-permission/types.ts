import type { TreeOption } from 'naive-ui'

export type PermissionFilter = 'all' | 'checked' | 'unchecked'

export interface RoleMenuTreeNode extends TreeOption {
  key: number
  label: string
  name: string
  code: string
  menuType: System.Menu['type']
  permission?: string
  children?: RoleMenuTreeNode[]
}

export interface RoleMenuChange {
  id: number
  name: string
  code: string
  menuType: System.Menu['type']
  risk: boolean
}
