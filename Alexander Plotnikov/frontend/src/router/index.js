import { createRouter, createWebHashHistory } from 'vue-router'
import Tasks from '../views/Tasks.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Tasks,
  },
  {
    path: '/registration',
    name: 'registration',
    component: () => import('../views/registration.vue'),
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/auth.vue'),
  },
  {
    path: '/persanArea',
    name: 'persanArea',
    component: () => import('../views/persanArea.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  mode: history,
  routes,
})

export default router
