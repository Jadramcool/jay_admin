import request from '@/utils/http/axios';

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
  list: (params?: Api.PageParams) => request.get<Api.PaginatedList<System.Role>>({ url: API.list, params }),

  all: () => request.get<System.Role[]>({ url: API.all }),

  detail: (id: number) => request.get<{ menus: System.Menu[] }>({ url: `${API.detail}/${id}` }),

  create: (data: Partial<System.Role>) => request.post({ url: API.create, data }),

  update: (data: Partial<System.Role>) => request.put({ url: API.update, data }),

  delete: (id: number) => request.delete({ url: `${API.delete}/${id}` }),

  assignMenu: (roleId: number, menuIds: number[]) => request.post({ url: API.roleMenu, data: { roleId, menuIds } }),
};
