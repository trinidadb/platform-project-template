// src/store/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalUsers = computed(() => users.value.length)
  const activeUsers = computed(() => users.value.filter((user) => user.active).length)
  const inactiveUsers = computed(() => users.value.filter((user) => !user.active).length)

  async function fetchUsers() {
    loading.value = true
    error.value = null

    try {
      const response = await api.getUsers()
      users.value = response.data
    } catch (e) {
      error.value = 'Error al cargar los usuarios.'
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(userId) {
    try {
      await api.deleteUser(userId)
      users.value = users.value.filter((user) => user.id !== userId)
    } catch (e) {
      console.error('Error al eliminar el usuario:', e)
      error.value = 'Error al eliminar el usuario.'
    }
  }

  async function createUser(userData) {
    try {
      loading.value = true
      const response = await api.createUser(userData)
      users.value.unshift(response.data)
    } catch (e) {
      error.value = 'Error creating user.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function updateUser(userId, userData) {
    try {
      loading.value = true
      const response = await api.updateUser(userId, userData)
      const index = users.value.findIndex((user) => user.id === userId)
      if (index !== -1) {
        users.value[index] = response.data
      }
    } catch (e) {
      error.value = 'Error updating user.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    totalUsers,
    activeUsers,
    inactiveUsers,
    fetchUsers,
    deleteUser,
    createUser,
    updateUser,
  }
})
