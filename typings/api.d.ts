// 请求参数类型由后端 OpenAPI 生成,避免契约漂移:
// 后端修改 DTO → 重新导出 openapi.json → pnpm gen:api → typecheck
// (响应类型暂保留手写,后端补齐 @ApiOkResponse 后可逐步迁移)
import type { components } from './openapi'

declare global {
  namespace Api {
    interface FieldError {
      field: string
      message: string
    }

    interface SuccessResponse<T = unknown> {
      code: 200
      message: string
      data: T
    }

    interface ErrorResponse {
      code: number
      message: string
      data: null
      traceId?: string
      fieldErrors?: FieldError[]
    }

    type BaseResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

    interface PaginatedData<T> {
      items: T[]
      total: number
      page: number
      pageSize: number
    }

    interface PageParams {
      page?: number
      pageSize?: number
      keyword?: string
      sortField?: string
      sortOrder?: 'asc' | 'desc'
      startDate?: string
      endDate?: string
      createdTime?: [number, number]
      updatedTime?: [number, number]
      filters?: Record<string, string | number | boolean | undefined>
      [key: string]: unknown
    }

    // ── 请求参数:与后端 DTO 严格绑定(来源: openapi.d.ts) ──
    type LoginParams = components['schemas']['LoginDto']
    type RegisterParams = components['schemas']['RegisterDto']
    type RefreshTokenParams = components['schemas']['RefreshTokenDto']
    type CheckPasswordParams = components['schemas']['CheckPasswordDto']
    type UpdatePasswordParams = components['schemas']['UpdatePasswordDto']
    type UserProfileUpdate = components['schemas']['UpdateUserDto']

    interface LoginResult {
      accessToken: string
      refreshToken: string
      expiresIn: number
      tokenType: 'Bearer'
    }

    interface RefreshResult {
      accessToken: string
      refreshToken: string
    }

    interface UploadResult {
      id: string | number
      url: string
      name: string
      size: number
      mimeType: string
      width?: number
      height?: number
    }

    interface NoticePushEvent {
      noticeId: number
      id?: number
      title: string
      content?: string
      type: System.Notice['type']
      isMandatory: boolean
      isPinned?: boolean
      publishedAt?: string
    }

    interface ServerToClientEvents {
      newNotice: (payload: NoticePushEvent) => void
    }

    interface ClientToServerEvents {}

    interface UserInfo {
      id: number
      username: string
      name?: string
      phone?: string
      email?: string
      sex?: System.User['sex']
      avatar?: string
      birthday?: string
      city?: string
      address?: string
      addressDetail?: string
      status: System.BinaryStatus
      roleType: System.UserRoleType
      position?: string
      joinedAt?: string
      departmentId?: number
      departmentName?: string
      roles: System.Role[]
      /** 功能权限码列表（v-auth 按钮级控制） */
      permissions: string[]
    }
  }
}
