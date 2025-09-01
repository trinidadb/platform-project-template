<template>
  <div class="admin-home-container">
    <div class="header-with-action">
      <h1>User Management</h1>
      <button @click="handleAddUser" class="btn btn-accent btn-add-user">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon"
        >
          <path
            fill-rule="evenodd"
            d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <UserTable
      :users="users"
      :loading="loading"
      :error="error"
      @editUser="handleEditUser"
      @deleteUser="handleDeleteUser"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import UserTable from '../components/UserTable.vue'

const router = useRouter()
const userStore = useUserStore()
const { users, loading, error } = storeToRefs(userStore)

onMounted(() => {
  userStore.fetchUsers()
})

async function handleDeleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    await userStore.deleteUser(userId)
  }
}

function handleEditUser(userId) {
  router.push({ name: 'user-edit', params: { id: userId } })
}

function handleAddUser() {
  router.push({ name: 'user-create' })
}
</script>

<style scoped>
.admin-home-container {
  background-color: var(--background-card);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--box-shadow-medium);
}

.header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.header-with-action h1 {
  font-size: 2.2rem;
  color: var(--primary-color);
}

.btn-add-user {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  padding: 0;
  font-size: 1.5rem;
}

.btn-add-user .icon {
  width: 1.5em;
  height: 1.5em;
}
</style>
