// 请求 payload 类型由后端 OpenAPI 生成,避免契约漂移(来源: openapi.d.ts)
import type { components } from './openapi'

declare global {
  namespace System {
    type BinaryStatus = 0 | 1
    type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
    type NoticeReadStatus = 'unread' | 'read'
    type NoticeScopeType = 'ALL' | NoticeTargetType
    type NoticeTargetType = 'ROLE' | 'DEPARTMENT' | 'USER'
    type NoticeType = 'NOTICE' | 'INFO' | 'ACTIVITY'
    type OperationStatus = 'SUCCESS' | 'FAILED' | 'PENDING'
    type OperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'READ' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'OTHER'
    type UserRoleType = 'admin' | 'user' | 'editor' | 'auditor' | 'manager'

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
      status: BinaryStatus
      roleType: UserRoleType
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
      isSystem?: boolean
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
      extraData?: Record<string, unknown>
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
      status: BinaryStatus
      managerId?: number
      parentId?: number | null
      directChildCount?: number
      memberCount?: number
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
      operationType: OperationType
      module?: string
      description?: string
      method?: HttpMethod
      url?: string
      params?: string
      result?: string
      status: OperationStatus
      errorMessage?: string
      ipAddress?: string
      userAgent?: string
      duration?: number
      createdTime: string
    }

    interface Notice {
      id: number
      title: string
      content?: string
      type: NoticeType
      authorId: number
      authorName?: string
      status: BinaryStatus
      isPinned: boolean
      isMandatory: boolean
      scopeType: NoticeScopeType
      scopeTargets?: NoticeTarget[]
      publishedAt?: string
      readCount?: number
      unreadCount?: number
      totalReceivers?: number
      createdTime: string
      updatedTime: string
    }

    interface NoticeTarget {
      id: number
      noticeId: number
      targetType: NoticeTargetType
      targetId: number
    }

    // ── 登录会话 ──
    interface UserSession {
      id: number
      userId: number
      username: string
      userName?: string | null
      refreshToken: string
      ipAddress?: string | null
      userAgent?: string | null
      expiresAt: string
      lastActiveAt: string
      createdTime: string
    }

    // ── 前端监控事件 ──
    interface ClientEvent {
      id: number
      type: 'error' | 'pageview'
      category?: string
      message?: string
      stack?: string
      url?: string
      route?: string
      userId?: number | null
      browser?: string | null
      extra?: Record<string, unknown> | null
      createdTime: string
    }

    // ── 待办事项 ──
    interface Todo {
      id: number
      pid?: number | null
      title: string
      content?: string
      sortOrder: number
      isDone: boolean
      doneTime?: string | null
      createdTime: string
      updatedTime?: string | null
      children?: Todo[]
    }

    // ── 数据字典 ──
    interface DictType {
      id: number
      code: string
      name: string
      status: BinaryStatus
      remark?: string
      itemCount?: number
      createdTime: string
      updatedTime: string
    }

    interface DictItem {
      id: number
      typeId: number
      code: string
      label: string
      sortOrder: number
      status: BinaryStatus
      createdTime: string
      updatedTime: string
      type?: { id: number, code: string, name: string }
    }

    // ── 请求 payload:与后端 DTO 严格绑定 ──
    type UserCreatePayload = components['schemas']['CreateUserDto']
    type UserUpdatePayload = components['schemas']['UpdateUserDto'] & { id: number }
  }
}
