// src/store/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useUserStore = defineStore('user', () => {
  /**
   * @module useUserStore
   * @description Manages the state and business logic for users.
   * This includes fetching, creating, updating, and deleting users,
   * as well as providing reactive state and getters for the UI.
   */

  // --- STATE ---
  /**
   * The array of user objects.
   * @type {import('vue').Ref<Array<object>>}
   */
  const users = ref([])
  /**
   * A boolean flag to indicate when an API call is in progress.
   * @type {import('vue').Ref<boolean>}
   */
  const loading = ref(false)
  /**
   * Holds any error message that occurs during an API call.
   * @type {import('vue').Ref<string|null>}
   */
  const error = ref(null)

  // --- GETTERS ---
  /**
   * The total number of users.
   * @returns {import('vue').ComputedRef<number>}
   */
  const totalUsers = computed(() => users.value.length)
  /**
   * The number of users with an 'active' status.
   * @returns {import('vue').ComputedRef<number>}
   */
  const activeUsers = computed(() => users.value.filter((user) => user.active).length)
  /**
   * The number of users with an 'inactive' status.
   * @returns {import('vue').ComputedRef<number>}
   */
  const inactiveUsers = computed(() => users.value.filter((user) => !user.active).length)

  // --- ACTIONS ---
  /**
   * Fetches the full list of users from the API and populates the state.
   * Sets the loading state during the request.
   * @returns {Promise<void>} A promise that resolves when the users have been fetched.
   */
  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await api.getUsers()
      users.value = response.data
    } catch (e) {
      error.value = 'Error fetching users.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Deletes a user from the API and removes them from the local state.
   * @param {string} userId - The unique ID of the user to be deleted.
   * @returns {Promise<void>} A promise that resolves when the user is successfully deleted.
   */
  async function deleteUser(userId) {
    try {
      await api.deleteUser(userId)
      users.value = users.value.filter((user) => user.id !== userId)
    } catch (e) {
      console.error('Error deleting user:', e)
      error.value = 'Error deleting user.'
    }
  }

  /**
   * Creates a new user via the API and adds it to the beginning of the local state array.
   * @param {object} userData - The user data for the new user.
   * @param {string} userData.name - The name of the user.
   * @param {string} userData.email - The email of the user.
   * @param {boolean} userData.active - The active status of the user.
   * @param {string} userData.birth_date - The birth date in 'YYYY-MM-DD' format.
   * @returns {Promise<void>} A promise that resolves when the user is created.
   */
  async function createUser(userData) {
    try {
      loading.value = true
      const response = await api.createUser(userData)
      if (response.data.success) {
        users.value.unshift(response.data.data)
      }
    } catch (e) {
      error.value = 'Error creating user.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates an existing user via the API and refreshes the user's data in the local state.
   * @param {string} userId - The unique ID of the user to be updated.
   * @param {object} userData - An object containing the user fields to update.
   * @returns {Promise<void>} A promise that resolves when the user is updated.
   */
  async function updateUser(userId, userData) {
    try {
      loading.value = true
      const response = await api.updateUser(userId, userData)
      if (response.data.success) {
        const index = users.value.findIndex((user) => user.id === userId)
        if (index !== -1) {
          users.value[index] = response.data.data
        }
      }
    } catch (e) {
      error.value = 'Error updating user.'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    users,
    loading,
    error,
    // Getters
    totalUsers,
    activeUsers,
    inactiveUsers,
    // Actions
    fetchUsers,
    deleteUser,
    createUser,
    updateUser,
  }
})
