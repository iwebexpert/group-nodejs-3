import * as User from '@/api/user'

export default {
  namespaced: true,
  state: {
    user: null,
  },
  getters: {
    user: (state) => state.user,
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      console.log()
    },
  },
  actions: {
    async getUser({ commit }) {
      try {
        let token = localStorage.getItem('token')
        let res = await User.check(token)
        commit('setUser', res)
      } catch (e) {
        console.log(2)
        commit('setUser', null)
      }
    },
    setUser({ commit }, user) {
      commit('setUser', user)
    },
  },
}
