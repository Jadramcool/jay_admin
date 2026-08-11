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
}
