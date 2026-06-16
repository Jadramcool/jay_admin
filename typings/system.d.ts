declare namespace System {
  interface User {
    id: number
    username: string
    name?: string
    phone?: string
    email?: string
    sex?: 'MALE' | 'FEMALE' | 'OTHER'
    avatar?: string
    birthday?: string
    city?: string
    address?: string
    addressDetail?: string
    status: 0 | 1
    roleType: string
    position?: string
    departmentId?: number
    departmentName?: string
    roles: Role[]
    createdTime: string
    updatedTime: string
  }

  interface Role {
    id: number
    code: string
    name: string
    description?: string
    isDeleted?: boolean
    createdTime: string
    updatedTime: string
    _count?: {
      users: number
      menus: number
    }
  }

  interface Menu {
    id: number
    code: string
    name: string
    permission?: string
    type: 'DIRECTORY' | 'MENU' | 'BUTTON'
    pid?: number
    path?: string
    redirect?: string
    icon?: string
    component?: string
    layout?: string
    keepAlive?: boolean
    show?: boolean
    enable?: boolean
    order?: number
    needLogin?: boolean
    isFrame?: boolean
    frameSrc?: string
    target?: string
    affix?: boolean
    alwaysShow?: boolean
    badge?: string
    badgeType?: string
    withContentCard?: boolean
    description?: string
    extraData?: Record<string, any>
    children?: Menu[]
    createdTime?: string
    updatedTime?: string
  }

  interface Department {
    id: number
    name: string
    code: string
    description?: string
    level?: number
    sortOrder?: number
    status: 0 | 1
    managerId?: number
    parentId?: number
    children?: Department[]
    createdTime: string
    updatedTime: string
  }

  interface SysConfig {
    id: number
    name: string
    key: string
    value: string
    type?: string
    description?: string
    category?: string
    isPublic: boolean
    isSystem: boolean
    sortOrder?: number
    createdTime: string
    updatedTime: string
  }

  interface OperationLog {
    id: number
    userId?: number
    username?: string
    operationType: string
    module?: string
    description?: string
    method?: string
    url?: string
    params?: string
    result?: string
    status: string
    errorMessage?: string
    ipAddress?: string
    userAgent?: string
    duration?: number
    createdTime: string
  }
}
