import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/user/login.vue'),
        meta: { title: '用户登录' }
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', requiresAuth: true }
      },
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/project/index.vue'),
        meta: { title: '项目管理', requiresAuth: true }
      },
      {
        path: 'project/detail/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/detail.vue'),
        meta: { title: '项目详情', requiresAuth: true }
      },
      {
        path: 'project/task',
        name: 'TaskList',
        component: () => import('@/views/project/task/index.vue'),
        meta: { title: '任务列表', requiresAuth: true }
      },
      {
        path: 'project/task/detail/:id',
        name: 'TaskDetail',
        component: () => import('@/views/project/task/detail.vue'),
        meta: { title: '任务详情', requiresAuth: true }
      },
      {
        path: 'project/task/edit/:id',
        name: 'TaskEdit',
        component: () => import('@/views/project/task/index.vue'),
        props: (route) => ({ isEdit: true, taskId: route.params.id }),
        meta: { title: '编辑任务', requiresAuth: true }
      },
      {
        path: 'cesium',
        name: 'Cesium',
        component: () => import('@/views/cesium/index.vue'),
        meta: { title: '三维地图', requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/admin/index.vue'),
        meta: { title: '系统管理', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/profile.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const { token } = userStore
  
  if (to.meta.requiresAuth && !token) {
    next({ path: '/user/login' })
  } else {
    next()
  }
})

export default router
