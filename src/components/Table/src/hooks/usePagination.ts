import { APISETTING, DEFAULTPAGESIZE, PAGESIZES } from '../const'

export function usePagination(refProps: any) {
  const configRef = ref<any>({})
  const show = shallowRef(true)

  const getPaginationInfo = computed(() => {
    const { pagination } = unref(refProps)
    if (!unref(show) || (isBoolean(pagination) && !pagination)) {
      return false
    }

    const { itemCountField } = APISETTING
    const config = unref(configRef)
    const pageSize = config.pageSize || DEFAULTPAGESIZE
    const itemCount = config[itemCountField] || 0
    const pageCount = config.pageCount ?? Math.ceil(itemCount / pageSize)
    const pageSizes = config.pageSizes || PAGESIZES
    if (config?.pageSize && !pageSizes.includes(config.pageSize)) {
      const index = pageSizes.findIndex(
        (item: number) => item > config.pageSize,
      )
      pageSizes.splice(index, 0, config.pageSize)
    }
    return {
      pageSize,
      pageSizes,
      showSizePicker: true,
      showQuickJumper: true,
      ...(isBoolean(pagination) ? {} : pagination),
      ...config,
      pageCount,
      itemCount,
      prefix: (info: any) => `共${info.itemCount}条数据，共${info.pageCount}页`,
      onUpdatePage: () => {},
      onUpdatePageSize: () => {},
    }
  })

  const setPagination = (info: any) => {
    const paginationInfo = unref(getPaginationInfo)
    configRef.value = {
      ...(!isBoolean(paginationInfo) ? paginationInfo : {}),
      ...info,
    }
  }

  const getPagination = (): any => {
    return unref(getPaginationInfo)
  }

  const getShowPagination = (): boolean => {
    return unref(show)
  }

  const setShowPagination = async (flag: boolean): Promise<void> => {
    show.value = flag
  }

  return {
    getPaginationInfo,
    getPagination,
    setPagination,
    getShowPagination,
    setShowPagination,
  }
}
