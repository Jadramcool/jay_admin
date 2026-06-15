import type { Router } from 'vue-router';
import { useTabStore } from '@/store/modules';

export function createPageTitleGuard(router: Router) {
  router.afterEach((to) => {
    document.title = (to.meta?.title as string) || 'JDM Admin';
    const tabStore = useTabStore();
    tabStore.addTab(to);
  });
}
