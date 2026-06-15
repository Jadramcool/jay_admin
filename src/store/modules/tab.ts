import type { RouteLocationNormalized } from 'vue-router'
import { defineStore } from 'pinia'

interface TabState {
  tabs: RouteLocationNormalized[]
  activeTab: string
}

export const useTabStore = defineStore('tab', {
  state: (): TabState => ({
    tabs: [],
    activeTab: '',
  }),
  getters: {
    getActiveTab: state => state.activeTab,
    getTabs: state => state.tabs,
  },
  actions: {
    addTab(route: RouteLocationNormalized) {
      if (['/login', '/403', '/404'].includes(route.path))
        return
      const exists = this.tabs.some(tab => tab.path === route.path)
      if (!exists) {
        this.tabs.push(route)
      }
      this.activeTab = route.path
    },
    closeTab(path: string) {
      const index = this.tabs.findIndex(tab => tab.path === path)
      if (index > -1) {
        this.tabs.splice(index, 1)
        if (this.activeTab === path) {
          const newIndex = Math.min(index, this.tabs.length - 1)
          this.activeTab = this.tabs[newIndex]?.path || ''
        }
      }
    },
    closeOtherTabs(path: string) {
      this.tabs = this.tabs.filter(tab => tab.path === path)
      this.activeTab = path
    },
    closeLeftTabs(path: string) {
      const index = this.tabs.findIndex(tab => tab.path === path)
      if (index > -1) {
        this.tabs = this.tabs.slice(index)
        this.activeTab = path
      }
    },
    closeRightTabs(path: string) {
      const index = this.tabs.findIndex(tab => tab.path === path)
      if (index > -1) {
        this.tabs = this.tabs.slice(0, index + 1)
        this.activeTab = path
      }
    },
    reorderTab(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex)
        return
      const [removed] = this.tabs.splice(fromIndex, 1)
      this.tabs.splice(toIndex, 0, removed)
    },
    closeAllTabs() {
      this.tabs = []
      this.activeTab = ''
    },
    setActiveTab(path: string) {
      this.activeTab = path
    },
  },
  persist: {
    pick: ['tabs'],
  },
})
