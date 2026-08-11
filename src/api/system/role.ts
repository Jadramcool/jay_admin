import request from '@/utils/http/axios'

enum API {
  list = '/system/role/list',
  all = '/system/role/all',
  detail = '/system/role',
  create = '/system/role/create',
  update = '/system/role/update',
  delete = '/system/role/delete',
  roleMenu = '/system/role/update/menu',
}

export const RoleApi = {
  list: (params?: Api.PageParams) => request.get<Api.PaginatedData<System.Role>>({ url: API.list, params }),

  all: () => request.get<System.Role[]>({ url: API.all }),

  detail: (id: number) => request.get<{ menus: System.Menu[] }>({ url: `${API.detail}/${id}` }),

  users: (id: number, params?: Api.PageParams) =>
    request.get<Api.PaginatedData<System.User>>({ url: `${API.detail}/users/${id}`, params }),

  create: (data: Partial<System.Role>) => request.post<null>({ url: API.create, data }),

  update: (data: Partial<System.Role>) => request.put<null>({ url: API.update, data }),

  delete: (id: number) => request.delete<null>({ url: `${API.delete}/${id}` }),

  assignMenu: (roleId: number, menuIds: number[]) => request.post<null>({ url: API.roleMenu, data: { roleId, menuIds } }),
}
