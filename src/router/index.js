import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SchoolListView from "../views/SchoolListView.vue";
import SchoolDetailView from "../views/SchoolDetailView.vue";
const router = createRouter({
 history: createWebHistory(),
 routes: [
 { path: "/", name: "home", component: HomeView },
 { path: "/schools", name: "schools", component: SchoolListView },
 {
 path: "/schools/:id",
 name: "school-detail",
 component: SchoolDetailView
 }
 ]
});

export default router;
