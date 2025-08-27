<template>
  <div>
    <h1>List of users</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button @click="editUser(user.id)">Update</button>
            <button @click="deleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
    };
  },
  methods: {
    fetchUsers() {
      // Here you can make a call to the backend to get the users.
      this.$http.get("/api/users").then((response) => {
        this.users = response.data;
      });
    },
    editUser(id) {
      // Navigate to the edit screen with the user ID
      this.$router.push({ name: "editUser", params: { id } });
    },
    deleteUser(id) {
      // Call to the backend to delete the user
      this.$http.delete(`/api/users/${id}`).then(() => {
        this.fetchUsers(); // Actualiza la lista después de eliminar
      });
    },
  },
  created() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
/* Here you can add styles for the UserList table */
</style>
