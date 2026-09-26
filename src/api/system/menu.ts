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
    request.get<Api.PaginatedData<System.Menu>>({ url: API.list, params }),

  /** 菜单树；传 platform 时只返回该端的节点 */
  tree: (platform?: string) =>
    request.get<System.Menu[]>({
      url: API.tree,
      params: platform ? { platform } : undefined,
    }),

  create: (data: Partial<System.Menu>) =>
    request.post<null>({ url: API.create, data }),

  update: (data: Partial<System.Menu>) =>
    request.put<null>({ url: API.update, data }),

  delete: (id: number) => request.delete<null>({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) =>
    request.delete<null>({ url: API.batchDelete, data: { ids } }),

  onlineMenus: () => request.get<System.Menu[]>({ url: API.onlineMenus }),
}
