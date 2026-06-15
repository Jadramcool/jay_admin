import { isBoolean } from "@/utils/common";
import { APISETTING } from "../const";
import axios from "axios";

interface TableProps {
  request?: (params: any) => Promise<any>;
  pagination?: boolean | Record<string, any>;
  filters?: Record<string, any>;
  localPagination?: boolean;
  autoLoad?: boolean;
}

interface PaginationHooks {
  getPaginationInfo: ComputedRef<any>;
  setPagination: (info: Record<string, any>) => void;
  setLoading: (status: boolean) => void;
}

export const useDataSource = (
  propsRef: TableProps,
  { getPaginationInfo, setPagination, setLoading }: PaginationHooks,
) => {
  const fullDataSourceRef = ref<any[]>([]);
  const dataSourceRef = ref<any[]>([]);

  const { pageField, sizeField, listField, totalField, itemCountField } =
    APISETTING;

  const handleLocalPagination = (data: any[]) => {
    const pagination = unref(getPaginationInfo);
    if (!pagination) return data;

    const { page = 1, pageSize = 10 } = pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    setPagination({
      [pageField]: page,
      [totalField]: Math.ceil(data.length / pageSize),
      [itemCountField]: data.length,
    });
    return data.slice(start, end);
  };

  async function fetch(opt: any) {
    try {
      setLoading(true);
      const { request, pagination, filters, localPagination } = unref(propsRef);
      if (!request) return;

      let pageParams: any = {};
      const { page = 1, pageSize = 10 } = unref(getPaginationInfo);

      if (localPagination === true) {
        const params = {
          pagination: { page: 1, pageSize: 999 },
          ...toRaw(filters),
        };
        const res: any = await request(params);
        fullDataSourceRef.value = res?.list || res || [];
        dataSourceRef.value = handleLocalPagination(fullDataSourceRef.value);
      } else {
        if (
          (isBoolean(pagination) && !pagination) ||
          isBoolean(getPaginationInfo)
        ) {
          pageParams = {};
        } else {
          pageParams[pageField] = (opt && opt[pageField]) || page;
          pageParams[sizeField] = pageSize;
        }
        const params = { ...toRaw(filters || {}), ...pageParams };
        const res: any = await request(params);
        dataSourceRef.value = res?.list || res || [];

        const pageInfo = res.pagination || {};
        if (pageInfo) {
          setPagination({
            [pageField]: pageInfo[pageField],
            [totalField]: pageInfo[totalField] || 0,
            [itemCountField]: pageInfo[itemCountField],
          });
        }
      }
    } catch (e) {
      if (!axios.isCancel(e)) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }

  onMounted(() => {
    if (unref(propsRef).autoLoad) {
      setTimeout(() => fetch({}), 16);
    }
  });

  async function reload(opt: any = {}) {
    await fetch(opt);
  }

  return {
    dataSourceRef,
    fullDataSourceRef,
    reload,
    handleLocalPagination,
  };
};

