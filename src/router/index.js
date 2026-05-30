import { createRouter, createWebHistory } from 'vue-router'

import LayoutView  from '@/views/layout/index.vue';
import IndexView from '@/views/index/index.vue';
import DashboardView from '@/views/dashboard/index.vue';
import LoginView from '@/views/login/index.vue';
import GoodsView from '@/views/goods/index.vue';
import UserView from '@/views/user/index.vue';
import { User } from '@element-plus/icons-vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    //嵌套路由,用于动态展示菜单
    {
      path:'/',
      name:'',
      redirect:'/index',
      component:LayoutView,
      children:[
        {
          path:'index',
          name:'index',
          component:IndexView
        },
        {
          path:'dashboard',
          name:'dashboard',
          component:DashboardView
        },
        {
          path:'goods',
          name:'goods',
          component:GoodsView
        },
        {
          path:'user',
          name:'user',
          component:UserView
        }
      ]
    },
    {
      path:'/login',
      name:'login',
      component:LoginView
    }
  ]
})

export default router