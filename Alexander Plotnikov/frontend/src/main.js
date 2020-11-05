import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/scss/bootstrap.scss'
import 'font-awesome/scss/font-awesome.scss'


store.dispatch('user/getUser')
store.dispatch('tasks/getTasks')

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
