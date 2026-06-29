export function success(data, message = '操作成功') {
  return { code: 200, message, data }
}

export function fail(message = '操作失败', code = 400) {
  return { code, message, data: null }
}

export function paginated(list, total, page = 1, pageSize = 20) {
  return {
    list,
    pagination: { page, pageSize, total },
  }
}
