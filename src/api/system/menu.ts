import request from '@/utils/http/axios'

enum API {
  list = '/system/menu/list',
  tree = '/system/menu/tree',
  create = '/system/menu/create',
  update = '/system/menu/update',
  delete = '/system/menu/delete',
  batchDelete = '/system/menu/batchDelete',
  onlineMenus = '/system/menu/onlineMenus',
}

export const MenuApi = {
  list: (params?: Api.PageParams) =>
    request.get<Api.PaginatedList<System.Menu>>({ url: API.list, params }),

  tree: () => request.get<System.Menu[]>({ url: API.tree }),

  create: (data: Partial<System.Menu>) =>
    request.post({ url: API.create, data }),

  update: (data: Partial<System.Menu>) =>
    request.put({ url: API.update, data }),

  delete: (id: number) => request.delete({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) =>
    request.delete({ url: API.batchDelete, data: { ids } }),

  onlineMenus: () => request.get<System.Menu[]>({ url: API.onlineMenus }),
}
