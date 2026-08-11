import type { PaginationProps } from 'naive-ui'
import type { TableProps, TableRequestParams } from '../types'
import { isApiError } from '@/utils/http/api-error'
import { APISETTING, DEFAULTPAGESIZE } from '../const'
import {
  expectArrayData,
  expectPaginatedData,
} from '../pagination-contract'

interface PaginationHooks {
  getPaginationInfo: ComputedRef<false | PaginationProps>
  setPagination: (info: Partial<PaginationProps>) => void
  setLoading: (status: boolean) => void
}

export function useDataSource<T = unknown>(
  propsRef: TableProps<T>,
  { getPaginationInfo, setPagination, setLoading }: PaginationHooks,
) {
  const fullDataSourceRef = shallowRef<T[]>([])
  const dataSourceRef = shallowRef<T[]>([])
  const sortState: Pick<Api.PageParams, 'sortField' | 'sortOrder'> = {}

  const { itemCountField, pageField, sizeField, totalField } = APISETTING

  function handleLocalPagination(data: T[]): T[] {
    const pagination = unref(getPaginationInfo)
    if (!pagination)
      return data

    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? DEFAULTPAGESIZE
    const start = (page - 1) * pageSize

    setPagination({
      [pageField]: page,
      [totalField]: data.length,
      [itemCountField]: data.length,
      pageCount: Math.ceil(data.length / pageSize),
    })
    return data.slice(start, start + pageSize)
  }

  function updateSortState(options: Partial<Api.PageParams>): void {
    if ('sortField' in options)
      sortState.sortField = options.sortField
    if ('sortOrder' in options)
      sortState.sortOrder = options.sortOrder
  }

  async function fetch(options: Partial<Api.PageParams> = {}): Promise<void> {
    try {
      setLoading(true)
      const { filters, localPagination, pagination, request } = unref(propsRef)
      if (!request)
        return

      updateSortState(options)
      const filterParams = toRaw(filters ?? {})
      const paginationInfo = unref(getPaginationInfo)
      const usesPagination = paginationInfo !== false && pagination !== false

      if (localPagination) {
        const result = await request({ ...filterParams })
        fullDataSourceRef.value = expectArrayData(result)
        dataSourceRef.value = handleLocalPagination(fullDataSourceRef.value)
        return
      }

      if (!usesPagination) {
        const result = await request({ ...filterParams, ...sortState })
        dataSourceRef.value = expectArrayData(result)
        return
      }

      const page = options.page ?? paginationInfo.page ?? 1
      const pageSize = options.pageSize
        ?? paginationInfo.pageSize
        ?? DEFAULTPAGESIZE
      const params: TableRequestParams = {
        ...filterParams,
        ...sortState,
        page,
        pageSize,
      }
      const result = expectPaginatedData(await request(params))
      dataSourceRef.value = result.items
      setPagination({
        [pageField]: result.page,
        [sizeField]: result.pageSize,
        [totalField]: result.total,
        [itemCountField]: result.total,
        pageCount: Math.ceil(result.total / result.pageSize),
      })
    }
    catch (error) {
      if ((!isApiError(error) || error.kind !== 'cancelled') && import.meta.env.DEV)
        console.error(error)
    }
    finally {
      setLoading(false)
    }
  }

  onMounted(() => {
    if (unref(propsRef).autoLoad)
      setTimeout(fetch, 16)
  })

  async function reload(options: Partial<Api.PageParams> = {}): Promise<void> {
    await fetch(options)
  }

  return {
    dataSourceRef,
    fullDataSourceRef,
    handleLocalPagination,
    reload,
  }
}
