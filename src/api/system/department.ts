import request from '@/utils/http/axios'

export interface DepartmentCreateParams {
  name: string
  code: string
  parentId?: number | null
  sortOrder?: number
  description?: string
  status: 0 | 1
}

export interface DepartmentUpdateParams extends DepartmentCreateParams {
  id: number
}

export interface DepartmentMemberParams extends Api.PageParams {
  includeChildren?: boolean
  keyword?: string
}

enum API {
  list = '/system/department/list',
  tree = '/system/department/tree',
  detail = '/system/department/detail',
  create = '/system/department/create',
  update = '/system/department/update',
  delete = '/system/department/delete',
  enable = '/system/department/enable',
  disable = '/system/department/disable',
  search = '/system/department/search',
  members = '/system/department/members',
}

export const DepartmentApi = {
  list: (params?: Api.PageParams) =>
    request.get<Api.PaginatedList<System.Department>>({ url: API.list, params }),

  tree: () => request.get<System.Department[]>({ url: API.tree }),

  detail: (id: number) => request.get<System.Department>({ url: `${API.detail}/${id}` }),

  create: (data: DepartmentCreateParams) =>
    request.post<System.Department>({ url: API.create, data }),

  update: ({ id, ...data }: DepartmentUpdateParams) =>
    request.put<System.Department>({ url: `${API.update}/${id}`, data }),

  delete: (id: number) => request.delete({ url: `${API.delete}/${id}` }),

  enable: (id: number) => request.put({ url: `${API.enable}/${id}` }),

  disable: (id: number) => request.put({ url: `${API.disable}/${id}` }),

  members: (id: number, params?: DepartmentMemberParams) =>
    request.get<Api.PaginatedList<System.User>>({ url: `${API.members}/${id}`, params }),
}
