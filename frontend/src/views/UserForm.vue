<template>
  <div>
    <h1>{{ isEdit ? "Update" : "Create" }} User</h1>
    <form @submit.prevent="saveUser">
      <div>
        <label for="name">Name:</label>
        <input type="text" v-model="user.name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" required />
      </div>
      <div>
        <button type="submit">
          {{ isEdit ? "Save Changes" : "Create User" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: "",
        email: "",
      },
      isEdit: false,
    };
  },
  methods: {
    fetchUser() {
      const userId = this.$route.params.id;
      if (userId) {
        this.isEdit = true;
        this.$http.get(`/api/users/${userId}`).then((response) => {
          this.user = response.data;
        });
      }
    },
    saveUser() {
      const userId = this.$route.params.id;
      const apiCall = this.isEdit
        ? this.$http.put(`/api/users/${userId}`, this.user)
        : this.$http.post("/api/users", this.user);

      apiCall.then(() => {
        this.$router.push({ name: "userList" });
      });
    },
  },
  created() {
    this.fetchUser();
  },
};
</script>

<style scoped>
/* Form`s styles */
</style>
