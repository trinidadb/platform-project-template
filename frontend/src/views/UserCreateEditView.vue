<template>
  <div class="form-page-container">
    <div class="form-header">
      <button @click="goBack" class="btn btn-secondary back-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon"
        >
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 10.66l-2.653-2.653a.75.75 0 011.06-1.06l1.397 1.397 1.397-1.397a.75.75 0 011.06 1.06l-2.653 2.653c-.15.15-.352.22-.53.22h-.001a.75.75 0 01-.53-.22z"
            clip-rule="evenodd"
          />
        </svg>
        Back
      </button>
      <h1>{{ isEditMode ? 'Edit User' : 'Create New User' }}</h1>
    </div>

    <UserForm @submit="handleFormSubmit" :user="editingUser" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/userStore'
import UserForm from '../components/UserForm.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isEditMode = ref(false)
const editingUser = ref(null)

onMounted(async () => {
  if (route.params.id) {
    isEditMode.value = true
    await userStore.fetchUsers()
    editingUser.value = userStore.users.find((user) => user.id === route.params.id)
    if (!editingUser.value) {
      alert('User not found. Returning to the list.')
      router.push({ name: 'admin-home' })
    }
  }
})

async function handleFormSubmit(userData) {
  if (isEditMode.value) {
    await userStore.updateUser(route.params.id, userData)
  } else {
    await userStore.createUser(userData)
  }
  router.push({ name: 'user-management' })
}

function goBack() {
  router.push({ name: 'user-management' })
}
</script>

<style scoped>
.form-page-container {
  background-color: var(--background-card);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--box-shadow-medium);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.form-header h1 {
  font-size: 2rem;
  color: var(--primary-color);
}

.back-btn {
  background-color: #6c757d;
  color: white;
  padding: 8px 15px;
}
.back-btn:hover {
  background-color: #5a6268;
}
.back-btn .icon {
  width: 1.1em;
  height: 1.1em;
}
</style>
