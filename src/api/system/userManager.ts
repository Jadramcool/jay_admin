import request from '@/utils/http/axios'

/** 用户批量导入结果(与后端 importUsers 返回结构一致) */
export interface UserImportResult {
  total: number
  success: number
  failed: Array<{ row: number, errors: string[] }>
}

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
  export = '/system/user/export',
  import = '/system/user/import',
  importTemplate = '/system/user/import/template',
}

export const UserManagerApi = {
  list: (params?: Api.PageParams) => request.get<Api.PaginatedData<System.User>>({ url: API.list, params }),

  detail: (id: number) => request.get<System.User>({ url: `${API.detail}/${id}` }),

  create: (data: System.UserCreatePayload) =>
    request.post<null>({ url: API.create, data }),

  update: (data: System.UserUpdatePayload) =>
    request.put<null>({ url: API.update, data }),

  delete: (id: number) => request.put<null>({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) => request.put<null>({ url: API.batchDelete, data: { ids } }),

  updateStatus: (id: number, status: 0 | 1) => request.put<null>({ url: `${API.status}/${id}`, data: { status } }),

  assignRoles: (id: number, roleIds: number[]) => request.post<null>({ url: `${API.roles}/${id}`, data: { roleIds } }),

  resetPassword: (id: number, newPassword: string) => request.post<null>({ url: `${API.resetPassword}/${id}`, data: { newPassword } }),

  /** 导出用户列表(按当前筛选条件全量),返回 Excel 文件 Blob */
  exportExcel: (params?: Api.PageParams) =>
    request.download({ url: API.export, params, responseType: 'blob' }),

  /** 下载用户导入模板 */
  downloadImportTemplate: () =>
    request.download({ url: API.importTemplate, responseType: 'blob' }),

  /** 导入用户(Excel 文件) */
  importExcel: (file: File) => {
    const data = new FormData()
    data.append('file', file)
    return request.upload<UserImportResult>({ url: API.import, data })
  },
}
