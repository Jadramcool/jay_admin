import { isBoolean } from "@/utils/common";
import { APISETTING, DEFAULTPAGESIZE, PAGESIZES } from "../const";

export const usePagination = (refProps: any) => {
  const configRef = ref<any>({});
  const show = shallowRef(true);

  const getPaginationInfo = computed(() => {
    const { pagination } = unref(refProps);
    if (!unref(show) || (isBoolean(pagination) && !pagination)) {
      return false;
    }

    const { totalField, itemCountField } = APISETTING;
    const config = unref(configRef);
    const pageSizes = config.pageSizes || PAGESIZES;
    if (config?.pageSize && !pageSizes.includes(config.pageSize)) {
      const index = pageSizes.findIndex(
        (item: number) => item > config.pageSize,
      );
      pageSizes.splice(index, 0, config.pageSize);
    }
    return {
      pageSize: DEFAULTPAGESIZE,
      pageSizes,
      showSizePicker: true,
      showQuickJumper: true,
      ...(isBoolean(pagination) ? {} : pagination),
      ...config,
      pageCount: config[totalField],
      itemCount: config[itemCountField] || 0,
      prefix: (info: any) => `共${info.itemCount}条数据，共${info.pageCount}页`,
      onUpdatePage: () => {},
      onUpdatePageSize: () => {},
    };
  });

  const setPagination = (info: any) => {
    const paginationInfo = unref(getPaginationInfo);
    configRef.value = {
      ...(!isBoolean(paginationInfo) ? paginationInfo : {}),
      ...info,
    };
  };

  const getPagination = (): any => {
    return unref(getPaginationInfo);
  };

  const getShowPagination = (): boolean => {
    return unref(show);
  };

  const setShowPagination = async (flag: boolean): Promise<void> => {
    show.value = flag;
  };

  return {
    getPaginationInfo,
    getPagination,
    setPagination,
    getShowPagination,
    setShowPagination,
  };
};

