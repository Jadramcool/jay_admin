import request from '@/utils/http/axios'

export interface SysConfigQuery extends Api.PageParams {
  category?: string
  isPublic?: boolean
  isSystem?: boolean
  key?: string
  name?: string
  type?: string
}

enum API {
  list = '/system/config/list',
  create = '/system/config/create',
  update = '/system/config/update',
  delete = '/system/config/delete',
  batchDelete = '/system/config/batchDelete',
  status = '/system/config/status',
  resolve = '/system/config/resolve',
  public = '/system/config/public',
}

export const SysConfigApi = {
  list: (params?: SysConfigQuery) =>
    request.get<Api.PaginatedData<System.SysConfig>>({ url: API.list, params }),

  create: (data: Partial<System.SysConfig>) =>
    request.post<System.SysConfig>({ url: API.create, data }),

  update: (data: Partial<System.SysConfig> & { id: number }) =>
    request.put<System.SysConfig>({ url: API.update, data }),

  delete: (id: number) =>
    request.delete<{ id: number }>({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) =>
    request.put<{ ids: number[] }>({ url: API.batchDelete, data: { ids } }),

  updatePublicStatus: (id: number, isPublic: boolean) =>
    request.put<{ id: number, status: number }>({
      url: `${API.status}/${id}`,
      data: { status: isPublic ? 1 : 0 },
    }),

  /** 类型化读取单个配置(带后端缓存,消费方使用) */
  resolve: <T = unknown>(key: string) =>
    request.get<T>({ url: `${API.resolve}/${key}` }),

  /** 批量类型化读取 */
  resolveMany: (keys: string[]) =>
    request.get<Record<string, unknown>>({ url: API.resolve, params: { keys: keys.join(',') } }),

  /** 公开配置(匿名可读,登录页/布局品牌位使用) */
  getPublic: () =>
    request.get<System.SysConfig[]>({ url: API.public }),
}
