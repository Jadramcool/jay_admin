import type { TreeOption } from 'naive-ui'

export interface DepartmentTreeNode extends TreeOption {
  key: number
  label: string
  code: string
  status: 0 | 1
  parentId: number | null
  directChildCount: number
  children?: DepartmentTreeNode[]
}

export interface DepartmentTableExpose {
  reload: (options?: Record<string, unknown>) => Promise<void>
  setPagination: (options: Record<string, unknown>) => void
}

export interface DepartmentModalData {
  isUpdate: boolean
  record?: Partial<System.Department>
}

export interface DepartmentSaveResult {
  departmentId: number | null
  parentId: number | null
  isUpdate: boolean
}
