import request from '@/utils/http/axios'

enum API {
  typeList = '/system/dict/type/list',
  typeAll = '/system/dict/type/all',
  typeCreate = '/system/dict/type/create',
  typeUpdate = '/system/dict/type/update',
  typeDelete = '/system/dict/type/delete',
  typeStatus = '/system/dict/type/status',
  itemList = '/system/dict/item/list',
  itemCreate = '/system/dict/item/create',
  itemUpdate = '/system/dict/item/update',
  itemDelete = '/system/dict/item/delete',
  itemStatus = '/system/dict/item/status',
  itemsByCode = '/system/dict/items',
}

export const DictApi = {
  // ── 字典类型 ──
  getTypes: (params?: Api.PageParams & { code?: string, name?: string, status?: number }) =>
    request.get<Api.PaginatedData<System.DictType>>({ url: API.typeList, params }),

  getAllTypes: () => request.get<System.DictType[]>({ url: API.typeAll }),

  createType: (data: Partial<System.DictType>) =>
    request.post<System.DictType>({ url: API.typeCreate, data }),

  updateType: (data: Partial<System.DictType> & { id: number }) =>
    request.put<System.DictType>({ url: API.typeUpdate, data }),

  deleteType: (id: number) =>
    request.delete<{ id: number }>({ url: `${API.typeDelete}/${id}` }),

  updateTypeStatus: (id: number, status: 0 | 1) =>
    request.put<null>({ url: `${API.typeStatus}/${id}`, data: { status } }),

  // ── 字典项 ──
  getItems: (params?: Api.PageParams & { typeId?: number, typeCode?: string, keyword?: string, status?: number }) =>
    request.get<Api.PaginatedData<System.DictItem>>({ url: API.itemList, params }),

  /** 按类型编码获取启用项(字典下拉使用) */
  getItemsByCode: (code: string) =>
    request.get<System.DictItem[]>({ url: `${API.itemsByCode}/${code}` }),

  createItem: (data: Partial<System.DictItem>) =>
    request.post<System.DictItem>({ url: API.itemCreate, data }),

  updateItem: (data: Partial<System.DictItem> & { id: number }) =>
    request.put<System.DictItem>({ url: API.itemUpdate, data }),

  deleteItem: (id: number) =>
    request.delete<{ id: number }>({ url: `${API.itemDelete}/${id}` }),

  updateItemStatus: (id: number, status: 0 | 1) =>
    request.put<null>({ url: `${API.itemStatus}/${id}`, data: { status } }),
}
