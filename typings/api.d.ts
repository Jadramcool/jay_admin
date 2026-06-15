declare namespace Api {
  interface BaseResponse<T = any> {
    code: number
    message: string
    data: T
  }

  interface PaginatedList<T> {
    list: T[]
    pagination: {
      page: number
      pageSize: number
      total: number
    }
  }

  interface PageParams {
    page?: number
    pageSize?: number
    pagination?: boolean
    filters?: Recordable
    sorter?: Record<string, 'asc' | 'desc'>
    [key: string]: any
  }

  interface LoginParams {
    username: string
    password: string
    captcha?: string
    captchaId?: string
  }

  interface RegisterParams {
    username: string
    password: string
    confirmPassword: string
    phone?: string
    email?: string
  }

  interface LoginResult {
    accessToken: string
    refreshToken: string
    expiresIn: number
    tokenType: string
  }

  interface RefreshResult {
    accessToken: string
    refreshToken: string
  }

  interface UserInfo {
    id: number
    username: string
    name?: string
    phone?: string
    email?: string
    sex?: string
    avatar?: string
    birthday?: string
    city?: string
    address?: string
    addressDetail?: string
    status: number
    roleType: string
    position?: string
    joinedAt?: string
    departmentId?: number
    departmentName?: string
    roles: System.Role[]
  }
}
