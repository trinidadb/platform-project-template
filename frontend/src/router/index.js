import Vue from "vue";
import Router from "vue-router";
import UserList from "@/views/UserList.vue";
import UserForm from "@/views/UserForm.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "userList",
      component: UserList,
    },
    {
      path: "/user/:id/edit",
      name: "editUser",
      component: UserForm,
    },
    {
      path: "/user/create",
      name: "createUser",
      component: UserForm,
    },
  ],
});
