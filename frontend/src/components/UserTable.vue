<template>
  <div class="table-container">
    <div v-if="loading" class="loading-message">Loading users...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="users.length === 0" class="no-data-message">No users to display.</div>

    <table v-else class="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Birth Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.birth_date }}</td>
          <td>
            <span :class="['status-indicator', user.active ? 'status-active' : 'status-inactive']">
              {{ user.active ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td class="table-actions">
            <button @click="editUser(user.id)" class="btn btn-primary btn-icon">
              <img src="/edit.svg" alt="Edit" class="icon" />
              Edit
            </button>
            <button @click="deleteUser(user.id)" class="btn btn-danger btn-icon">
              <img src="/delete.svg" alt="Delete" class="icon" />
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['editUser', 'deleteUser'])

function editUser(userId) {
  emit('editUser', userId)
}

function deleteUser(userId) {
  emit('deleteUser', userId)
}
</script>

<style scoped>
.table-container {
  background-color: var(--background-card);
  border-radius: 8px;
  box-shadow: var(--box-shadow-medium);
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.user-table th,
.user-table td {
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.user-table th {
  background-color: #f8f8f8;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  font-size: 0.9rem;
}

.user-table tbody tr:last-child td {
  border-bottom: none;
}

.user-table tbody tr:hover {
  background-color: #f0f8ff;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.status-indicator {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-light);
}

.status-active {
  background-color: var(--accent-color);
}

.status-inactive {
  background-color: var(--danger-color);
}

/* Message Styles */
.loading-message,
.error-message,
.no-data-message {
  padding: 20px;
  text-align: center;
  font-size: 1.1rem;
  color: var(--text-color-dark);
}
.error-message {
  color: var(--danger-color);
}

.btn-icon .icon {
  width: 1.2em;
  height: 1.2em;
}
</style>
