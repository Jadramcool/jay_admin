import request from '@/utils/http/axios';

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

  create: (data: Partial<System.Department>) => request.post({ url: API.create, data }),

  update: (data: Partial<System.Department>) => request.put({ url: API.update, data }),

  delete: (id: number) => request.delete({ url: `${API.delete}/${id}` }),

  enable: (id: number) => request.put({ url: `${API.enable}/${id}` }),

  disable: (id: number) => request.put({ url: `${API.disable}/${id}` }),

  members: (id: number, params?: Api.PageParams & { includeChildren?: boolean }) =>
    request.get<Api.PaginatedList<System.User>>({ url: `${API.members}/${id}`, params }),
};
