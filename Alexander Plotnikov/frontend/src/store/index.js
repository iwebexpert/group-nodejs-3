import { createStore } from 'vuex'
import user from '@/store/user'
import tasks from '@/store/tasks'

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    user,
    tasks
  },
})
