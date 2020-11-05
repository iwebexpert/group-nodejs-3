<template>
  <div class="cont" v-if="user">
    <button
      type="button"
      class="btn btn-dark my-2 width100"
      :class="show ? 'blue' : ''"
      id="addtask"
      @click="show = !show"
    >
      {{ !show ? '+ Add task' : '- Close' }}
    </button>
    <form
      id="creatTask"
      class="animHeight"
      :class="show ? 'active' : ' '"
      @submit.prevent="newTask($event)"
    >
      <div class="form-group">
        <label for="exampleInputEmail1">
          Text of task
        </label>
        <textarea
          type="text"
          name="task"
          class="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Text of task"
        ></textarea>
      </div>
      <div class="row">
        <div class="form-group col-3">
          <label for="exampleInputPassword1">
            Status
          </label>
          <select class="custom-select status" id="selectStatus">
            <option value="1" selected>
              Waiting
            </option>
            <option value="2">
              Unknown
            </option>
            <option value="3">
              Done
            </option>
          </select>
        </div>
        <div class="form-group col-3">
          <label for="exampleInputPriority">
            Priority
          </label>
          <select class="custom-select priority" id="selectPriority">
            <option value="1" selected>
              High
            </option>
            <option value="2">
              Middle
            </option>
            <option value="3">
              Low
            </option>
          </select>
        </div>
        <div class="form-group col-3">
          <label for="exampleInputPassword1">
            Date
          </label>
          <input
            type="date"
            name="date"
            class="form-control"
            id="exampleInputDate"
            placeholder="status"
            value=""
          />
        </div>
      </div>
      <button type="submit" class="btn btn-primary">
        Create task
      </button>
    </form>

    <table class="table">
      <thead class="thead-dark">
        <tr class="row mx-0">
          <th scope="col" class="col-1 center">
            #
          </th>
          <th scope="col " class="col-3 center-height">
            Task
          </th>
          <th scope="col" class="col-2 center">
            Priotity
          </th>
          <th scope="col" class="col-2 center">
            Status
          </th>
          <th scope="col" class="col-2 center">
            Date
          </th>
          <th scope="col" class="col-2 center">
            Delete
          </th>
        </tr>
      </thead>
      <tbody id="alltasks">
        <tr class="row mx-0" v-for="(task, i) in tasks" :key="task._id">
          <td scope="row" class="col-1 center">
            <span>{{ i + 1 }}</span>
          </td>
          <td class="col-3 ver-cont">
            <div
              v-if="!task.showEdit"
              class="sb width100 p-1"
              :data-taskedit="task._id"
            >
              <p class="mb-0">{{ task.task }}</p>
              <button
                class="btn btn-outline-primary ml-1"
                @click="task.showEdit = true"
              >
                Edit
              </button>
            </div>
            <div v-else class="sb width100 p-1">
              <textarea
                class="form-control"
                :data-task="task._id"
                v-model="task.task"
              >
               {{ task.task }}
              </textarea>
              <button
                class="btn btn-outline-primary ml-1"
                @click="taskEdit(task._id)"
              >
                Save
              </button>
            </div>
          </td>
          <td scope="col" class="col-2 center priority-id rounded">
            <div class="priority-text">
              <span
                :data-prioritytext="task._id"
                :class="
                  task.priority === 'High'
                    ? 'high'
                    : task.priority === 'Low'
                    ? 'low'
                    : 'middle'
                "
                >{{ task.priority }}</span
              >
              <div class="select">
                <span
                  class="choice-status"
                  @click="editPriorety($event, task._id)"
                  >High</span
                >
                <span
                  class="choice-status"
                  @click="editPriorety($event, task._id)"
                  >Middle</span
                >
                <span
                  class="choice-status"
                  @click="editPriorety($event, task._id)"
                  >Low</span
                >
              </div>
            </div>
          </td>
          <td scope="col" class="col-2 center status-id rounded">
            <div class="status-text">
              <span
                :class="
                  task.status === 'Waiting'
                    ? 'high'
                    : task.status === 'Unknown'
                    ? 'low'
                    : 'middle'
                "
                >{{ task.status }}</span
              >
              <div class="select">
                <span
                  class="choice-status"
                  @click="editStatus($event, task._id)"
                  >Waiting</span
                >
                <span
                  class="choice-status"
                  @click="editStatus($event, task._id)"
                  >Unknown</span
                >
                <span
                  class="choice-status"
                  @click="editStatus($event, task._id)"
                  >Done</span
                >
              </div>
            </div>
          </td>
          <td scope="col" class="col-2 center">
            <span>{{ task.date }}</span>
          </td>
          <td scope="col" class="col-2 center">
            <button
              type="button"
              class="btn btn-dark"
              @click="delTask(task._id)"
            >
              Del task
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else class="cont">
    <h1>Для работы с задачами вам необходимо авторизироваться!</h1>
    <router-link
      :to="{ name: 'auth' }"
      class="to-registrate"
      exact
      active-class="active"
      >Войти</router-link
    >
    <router-link
      :to="{ name: 'registration' }"
      class="to-registrate"
      exact
      active-class="active"
      >Еще не зарегистрированны? Вам сюда...</router-link
    >
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
    show: false,
  }),
  components: {},
  methods: {
    ...mapActions({
      addTask: 'tasks/addTask',
      delTask: 'tasks/delTask',
      editTask: 'tasks/editTask',
    }),
    newTask(e) {
      let data = new FormData(e.target)
      let elStatus = document.querySelector('#selectStatus')
      let elPriority = document.querySelector('#selectPriority')
      let status = elStatus.options[elStatus.value - 1].innerHTML.trim()
      let priority = elPriority.options[elPriority.value - 1].innerHTML.trim()
      data.append('priority', priority)
      data.append('status', status)
      this.addTask(data)
    },
    async taskEdit(_id) {
      let idx = this.tasks.findIndex((t) => t._id === _id)
      let cb = () => (this.tasks[idx].showEdit = false)
      this.editTask({
        _id,
        task: this.tasks[idx].task,
        name: 'task',
        callback: cb,
      })
    },
    async editPriorety(e, _id) {
      let idx = this.tasks.findIndex((t) => t._id === _id)
      this.editTask({
        _id,
        task: e.target.innerHTML,
        name: 'priority',
        callback: () => null,
      })
    },
    async editStatus(e, _id) {
      let idx = this.tasks.findIndex((t) => t._id === _id)
      this.editTask({
        _id,
        task: e.target.innerHTML,
        name: 'status',
        callback: () => null,
      })
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/user',
      tasks: 'tasks/tasks',
    }),
  },
}
</script>
<style lang="scss" scoped>
h1 {
  font-size: 1.5rem;
  margin: 30px 0;
}
.to-registrate {
  margin: 10px 0;
  text-align: left;
  font-size: 1rem;
  color: $darkBaseFont;
  &:hover {
    color: $darkHoverFont;
  }
  &:active {
    color: $darkActiveFont;
  }
}
.list-enter-active,
.list-leave-active {
  transition: all 1s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@keyframes leave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
}
@keyframes enter {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
.apear {
  display: none;
}
.leave {
  animation: leave 0.9s linear;
}
.enter {
  animation: enter 0.9s linear;
}

.high {
  padding: 5px;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  width: 90%;
  background-color: rgba(255, 0, 170, 0.411);
}
.low {
  padding: 5px;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  width: 90%;
  background-color: rgba(53, 51, 52, 0.411);
}
.middle {
  padding: 5px;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  width: 90%;
  background-color: rgba(255, 75, 4, 0.411);
}
</style>
