<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome back, Admin! Here's an overview of the system.</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-number">{{ totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Users</h3>
        <p class="stat-number active">{{ activeUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Inactive Users</h3>
        <p class="stat-number inactive">{{ inactiveUsers }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()
const { totalUsers, activeUsers, inactiveUsers } = storeToRefs(userStore)

onMounted(() => {
  if (userStore.users.length === 0) {
    userStore.fetchUsers()
  }
})
</script>

<style scoped>
.dashboard-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.dashboard-header h1 {
  font-size: 2.2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: var(--background-card);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--box-shadow-light);
  text-align: center;
}
.stat-card h3 {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
}
.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
}
.stat-number.active {
  color: var(--accent-color);
}
.stat-number.inactive {
  color: var(--danger-color);
}
</style>
