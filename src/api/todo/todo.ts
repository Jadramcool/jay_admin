import request from '@/utils/http/axios'

enum API {
  list = '/todo/list',
  stats = '/todo/stats',
  create = '/todo/create',
  update = '/todo/update',
  toggle = '/todo/toggle',
  remove = '/todo/delete',
}

export const TodoApi = {
  /** 当前用户待办(平铺,含子任务 pid) */
  list: (params?: { onlyUndone?: 0 | 1, keyword?: string }) =>
    request.get<System.Todo[]>({ url: API.list, params }),

  stats: () =>
    request.get<{ total: number, undone: number, done: number }>({ url: API.stats }),

  create: (data: { title: string, content?: string, pid?: number, sortOrder?: number }) =>
    request.post<System.Todo>({ url: API.create, data }),

  update: (data: Partial<System.Todo> & { id: number }) =>
    request.put<System.Todo>({ url: API.update, data }),

  /** 完成/取消完成 */
  toggle: (id: number) =>
    request.put<System.Todo>({ url: `${API.toggle}/${id}` }),

  delete: (id: number) =>
    request.delete<{ id: number }>({ url: `${API.remove}/${id}` }),
}
