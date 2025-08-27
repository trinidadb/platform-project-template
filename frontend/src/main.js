// /frontend/src/main.js
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";

Vue.config.productionTip = false;

Vue.prototype.$http = axios; // set a

new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
