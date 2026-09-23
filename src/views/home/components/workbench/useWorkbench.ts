import type { Ref } from 'vue'
import { DashboardApi } from '@/api/dashboard'

/**
 * 工作台共享数据源:一次 /dashboard/mine 请求,待办/公告/动态三张卡片共用。
 * 由首页(home/index.vue)调用一次,数据经 props 下发,避免卡片各自请求。
 */
export function useWorkbench(visible: Ref<boolean>, enabled: Ref<boolean>) {
  const mine = ref<Dashboard.MineInfo | null>(null)
  const loading = ref(true)

  async function load() {
    loading.value = true
    try {
      mine.value = await DashboardApi.mine()
    }
    catch {
      mine.value = null
    }
    finally {
      loading.value = false
    }
  }

  watch(() => visible.value, (v) => {
    // 看板视图不需要工作台数据(enabled=false 时不请求)
    if (v && enabled.value && !mine.value)
      load()
  }, { immediate: true })

  return { mine, loading, reload: load }
}
