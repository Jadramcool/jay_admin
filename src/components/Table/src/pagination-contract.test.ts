import { describe, expect, it } from 'vitest'
import {
  expectArrayData,
  expectPaginatedData,
  isPaginatedData,
} from './pagination-contract'

describe('table pagination contract', () => {
  it('accepts the unified paginated response', () => {
    const page = { items: [{ id: 1 }], total: 1, page: 1, pageSize: 20 }

    expect(isPaginatedData(page)).toBe(true)
    expect(expectPaginatedData(page)).toBe(page)
  })

  it('rejects the legacy list and pagination response', () => {
    const legacy = {
      list: [{ id: 1 }],
      pagination: { page: 1, page_size: 20, total: 1 },
    }

    expect(() => expectPaginatedData(legacy as never)).toThrowError(
      /object keys: list, pagination/,
    )
  })

  it('keeps paginated and non-paginated request modes separate', () => {
    expect(() => expectPaginatedData([])).toThrowError(/received array/)
    expect(() => expectArrayData({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    })).toThrowError(/object keys: items, page, pageSize, total/)
  })
})
