import { shallowRef, readonly } from 'vue';

export const useLoading = (props: any) => {
  const loadingRef = shallowRef(unref(props).loading);

  watch(
    () => unref(props).loading,
    (loading) => {
      loadingRef.value = loading;
    },
  );

  const setLoading = (value: boolean) => {
    loadingRef.value = value;
  };

  return {
    getLoading: readonly(loadingRef),
    setLoading,
  };
};
