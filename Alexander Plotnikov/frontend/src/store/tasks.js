import * as Tasks from '@/api/tasks'

export default {
  namespaced: true,
  state: {
    tasks: [],
  },
  getters: {
    tasks: (state) => state.tasks,
  },
  mutations: {
    addTask(state, task) {
      state.tasks.push(task)
    },
    delTask(state, _id) {
      let idx = [...state.tasks].findIndex((t) => t._id === _id)
      if (+idx >= 0) {
        state.tasks.splice(idx, 1)
      }
    },
    setTasks(state, tasks) {
      state.tasks = tasks
    },
    editTask(state, field) {
      console.log(field)

      let idx = [...state.tasks].findIndex((t) => t._id === field._id)
      state.tasks[idx][field.name] = field.task
    },
  },
  actions: {
    async editTask({ commit }, { _id, task, name, callback }) {
      try {
        let token = localStorage.getItem('token')
        if (name === 'task') {
          await Tasks.editTask({ _id, task }, token)
          commit('editTask', { _id, task, name })
          callback()
        }
        if (name === 'priority') {
          await Tasks.editPriorety({ _id, priority: task }, token)
          commit('editTask', { _id, task, name })
          callback()
        }
        if (name === 'status') {
          await Tasks.editStatus({ _id, status: task }, token)
          commit('editTask', { _id, task, name })
          callback()
        }
      } catch (e) {
        console.log(e)
      }
    },

    async delTask({ commit }, _id) {
      try {
        let token = localStorage.getItem('token')
        await Tasks.delById(_id, token)
        commit('delTask', _id)
      } catch (e) {
        console.log(e)
      }
    },
    async getTasks({ commit }) {
      try {
        let token = localStorage.getItem('token')
        let { tasks } = await Tasks.all(token)
        commit(
          'setTasks',
          tasks.map((t) => ({ ...t, edit: false }))
        )
      } catch (e) {}
    },
    async addTask({ commit, dispatch }, task) {
      try {
        let token = localStorage.getItem('token')
        await Tasks.add(task, token)
        commit('addTask', task)
        dispatch('getTasks')
      } catch (e) {}
    },
  },
}
