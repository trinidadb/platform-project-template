<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/" class="navbar-logo">
        <img src="/logo.svg" alt="ERP Logo" class="logo-icon" />
        ERP Admin
      </RouterLink>
    </div>

    <div class="navbar-links">
      <RouterLink to="/" class="nav-link">Dashboard</RouterLink>
      <RouterLink to="/users" class="nav-link">Users</RouterLink>
    </div>

    <div class="navbar-user">
      <span>Hello, Admin</span>
      <button class="btn btn-primary logout-btn">Logout</button>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--background-card);
  box-shadow: var(--box-shadow-medium);
  border-bottom: 1px solid var(--border-color);
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-color-dark);
  font-size: 1.25rem;
  font-weight: bold;
}

.logo-icon {
  height: 30px;
  width: auto;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-color-dark);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

.nav-link:hover {
  color: var(--primary-color);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  padding: 8px 15px;
  font-size: 0.9rem;
}
</style>
