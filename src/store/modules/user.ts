import { defineStore } from 'pinia'

interface UserState {
  userInfo: Api.UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
  }),
  actions: {
    setUser(user: Api.UserInfo) {
      this.userInfo = user
    },
    resetUser() {
      this.$reset()
    },
  },
})
