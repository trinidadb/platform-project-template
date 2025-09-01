// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import UserCreateEditView from '../views/UserCreateEditView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UsersAdminView from '../views/UsersAdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: AdminDashboard,
    },
    {
      path: '/users',
      name: 'user-management',
      component: UsersAdminView,
    },
    {
      path: '/user/new',
      name: 'user-create',
      component: UserCreateEditView,
    },
    {
      path: '/user/edit/:id',
      name: 'user-edit',
      component: UserCreateEditView,
      props: true,
    },
  ],
})

export default router
