<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" v-model="formData.name" required />
    </div>
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="formData.email" required />
    </div>
    <div class="form-group">
      <label for="birth_date">Birth Date:</label>
      <input type="date" id="birth_date" v-model="formData.birth_date" />
    </div>
    <div class="form-group-checkbox">
      <input type="checkbox" id="active" v-model="formData.active" />
      <label for="active">Active</label>
    </div>
    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ name: '', email: '', birth_date: '', active: true }),
  },
})

const emit = defineEmits(['submit'])

const formData = ref({ ...props.user })

watch(
  () => props.user,
  (newUser) => {
    formData.value = { ...newUser }
  },
)

function handleSubmit() {
  const payload = {
    ...formData.value,
    active: !!formData.value.active,
  }
  emit('submit', payload)
}
</script>

<style scoped>
form {
  max-width: 600px;
  margin: 1rem auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--text-color-dark);
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group input[type='date'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.form-group-checkbox label {
  margin-bottom: 0;
  font-weight: normal;
}

.form-group-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
}

button[type='submit'] {
  width: 100%;
  padding: 0.85rem;
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
