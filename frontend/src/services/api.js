// src/services/api.js
import axios from 'axios';

/**
 * @module apiClient
 * @description Centralized Axios instance for all API calls.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:8083/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// let mockUsers = [
//   { 
//     id: '994fc575-dc38-4718-9fc5-6a23c0ae0832', 
//     name: 'John Doe', 
//     email: 'john.doe@example.com', 
//     active: true, 
//     birth_date: '1995-11-15' 
//   },
//   { 
//     id: 'af488024-dc38-4718-9fc5-6a23c0ae0832', 
//     name: 'Test name', 
//     email: 'test@example.com', 
//     active: true, 
//     birth_date: '2000-10-10' 
//   },
// ];

/**
 * @module apiService
 * @description Service layer for interacting with the user API endpoints.
 */
export default {
  /**
   * Fetches the list of all users.
   * @returns {Promise<import('axios').AxiosResponse<Array<object>>>} A promise that resolves to the Axios response containing the array of users.
   */
  getUsers() {
    return apiClient.get('users'); 
  },
  /**
   * Creates a new user.
   * @param {object} userData - The data for the new user.
   * @returns {Promise<import('axios').AxiosResponse<object>>} A promise that resolves to the Axios response containing the newly created user.
   */
  createUser(userData) {
    return apiClient.post('users/create', userData);
  },
  /**
   * Updates an existing user.
   * @param {string} userId - The ID of the user to update.
   * @param {object} userData - The user data fields to update.
   * @returns {Promise<import('axios').AxiosResponse<object>>} A promise that resolves to the Axios response containing the updated user.
   */
  updateUser(userId, userData) {
    return apiClient.put('users/update', { id: userId, ...userData });
  },
  /**
   * Deletes a user by their ID.
   * @param {string} userId - The ID of the user to delete.
   * @returns {Promise<import('axios').AxiosResponse>} A promise that resolves to the Axios response.
   */
  deleteUser(userId) {
    return apiClient.post('users/delete', { id: userId });
  }
};