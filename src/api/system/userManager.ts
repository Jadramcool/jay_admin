import request from '@/utils/http/axios';

enum API {
  list = '/system/user/list',
  detail = '/system/user/detail',
  create = '/system/user/create',
  update = '/system/user/update',
  delete = '/system/user/delete',
  batchDelete = '/system/user/batchDelete',
  status = '/system/user/status',
  roles = '/system/user/roles',
  resetPassword = '/system/user/reset-password',
}

export const UserManagerApi = {
  list: (params?: Api.PageParams) => request.get<Api.PaginatedList<System.User>>({ url: API.list, params }),

  detail: (id: number) => request.get<System.User>({ url: `${API.detail}/${id}` }),

  create: (data: any) => request.post({ url: API.create, data }),

  update: (data: any) => request.put({ url: API.update, data }),

  delete: (id: number) => request.put({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) => request.put({ url: API.batchDelete, data: { ids } }),

  updateStatus: (id: number, status: 0 | 1) => request.put({ url: `${API.status}/${id}`, data: { status } }),

  assignRoles: (id: number, roleIds: number[]) => request.post({ url: `${API.roles}/${id}`, data: { roleIds } }),

  resetPassword: (id: number, newPassword: string) => request.post({ url: `${API.resetPassword}/${id}`, data: { newPassword } }),
};
