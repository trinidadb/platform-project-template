// src/services/api.js
import axios from 'axios'

/**
 * @module apiClient
 * @description Centralized Axios instance for all API calls.
 * This instance is pre-configured with the base URL and default headers,
 * ensuring consistency across all requests.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * @module apiService
 * @description Service layer that abstracts all interactions with the backend user API.
 * Each function corresponds to a specific API endpoint.
 */
export default {
  /**
   * Fetches the list of all users from the backend.
   * Corresponds to the endpoint: GET /users/
   * @returns {Promise<import('axios').AxiosResponse<Array<object>>>} A promise that resolves to the Axios response containing the array of users.
   */
  getUsers() {
    return apiClient.get('/')
  },

  /**
   * Fetches a single user by their unique identifier.
   * Corresponds to the endpoint: GET /users/:id
   * @param {string} userId - The ID of the user to retrieve.
   * @returns {Promise<import('axios').AxiosResponse<object>>} A promise that resolves to the Axios response containing the user data.
   */
  getUserById(userId) {
    return apiClient.get(`/${userId}`)
  },

  /**
   * Sends a request to create a new user with the provided data.
   * Corresponds to the endpoint: POST /users/create
   * @param {object} userData - The data for the new user.
   * @returns {Promise<import('axios').AxiosResponse<object>>} A promise that resolves to the Axios response containing the newly created user.
   */
  createUser(userData) {
    return apiClient.post('/create', userData)
  },

  /**
   * Sends a request to update an existing user's data.
   * Corresponds to the endpoint: PUT /users/update
   * The user ID is included in the request body as per backend requirements.
   * @param {string} userId - The ID of the user to update.
   * @param {object} userData - An object containing the user fields to update.
   * @returns {Promise<import('axios').AxiosResponse<object>>} A promise that resolves to the Axios response containing the updated user.
   */
  updateUser(userId, userData) {
    return apiClient.put('/update', { id: userId, ...userData })
  },

  /**
   * Sends a request to delete a user.
   * Corresponds to the endpoint: POST /users/delete
   * @param {string} userId - The ID of the user to delete, sent in the request body.
   * @returns {Promise<import('axios').AxiosResponse>} A promise that resolves to the Axios response, typically with a success status.
   */
  deleteUser(userId) {
    return apiClient.post('/delete', { id: userId })
  },
}
