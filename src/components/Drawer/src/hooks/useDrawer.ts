import { ref, onUnmounted, nextTick } from 'vue';

export function useDrawer() {
  const drawerRef = ref<any>(null);
  const loadedRef = ref(false);

  function register(instance: any) {
    onUnmounted(() => {
      drawerRef.value = null;
      loadedRef.value = false;
    });
    if (loadedRef.value && instance === drawerRef.value) return;
    drawerRef.value = instance;
    loadedRef.value = true;
  }

  function getDrawer() {
    const drawer = drawerRef.value;
    if (!drawer) console.error('Drawer instance not found');
    return drawer;
  }

  const methods = {
    openDrawer: (data?: any) => getDrawer()?.openDrawer(data),
    closeDrawer: () => getDrawer()?.closeDrawer(),
    setDrawerProps: (props: any) => {},
  };

  return [register, methods] as const;
}

export function useDrawerInner(callback?: (data?: any) => void) {
  const drawerRef = ref<any>(null);
  const dataRef = ref<any>(null);

  function register(instance: any) {
    drawerRef.value = instance;
  }

  function openDrawer(data?: any) {
    dataRef.value = data;
    drawerRef.value?.openDrawer();
    nextTick(() => callback?.(data));
  }

  function closeDrawer() {
    drawerRef.value?.closeDrawer();
  }

  return [register, { openDrawer, closeDrawer }] as const;
}
