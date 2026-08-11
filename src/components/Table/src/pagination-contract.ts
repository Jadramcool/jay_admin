function describeReceivedValue(value: unknown): string {
  if (Array.isArray(value))
    return 'array'
  if (value && typeof value === 'object')
    return `object keys: ${Object.keys(value).sort().join(', ') || '(none)'}`
  return typeof value
}

export function isPaginatedData<T>(value: unknown): value is Api.PaginatedData<T> {
  if (!value || typeof value !== 'object')
    return false

  const data = value as Partial<Api.PaginatedData<T>>
  return Array.isArray(data.items)
    && Number.isInteger(data.total)
    && data.total! >= 0
    && Number.isInteger(data.page)
    && data.page! >= 1
    && Number.isInteger(data.pageSize)
    && data.pageSize! >= 1
}

export function expectArrayData<T>(value: Api.PaginatedData<T> | T[]): T[] {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `Non-paginated table requests must return an array; received ${describeReceivedValue(value)}`,
    )
  }
  return value
}

export function expectPaginatedData<T>(
  value: Api.PaginatedData<T> | T[],
): Api.PaginatedData<T> {
  if (!isPaginatedData<T>(value)) {
    throw new TypeError(
      `Paginated table requests must return items, total, page and pageSize; received ${describeReceivedValue(value)}`,
    )
  }
  return value
}
