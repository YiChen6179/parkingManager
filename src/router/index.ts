import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/auth'
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/Auth.vue'),
      meta: { title: '登录/注册' }
    },
    {
      path: '/main',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/parking-lots',
          name: 'parking-lots',
          component: () => import('../views/parking/ParkingLots.vue'),
          meta: { title: '停车场管理' }
        },
        {
          path: '/parking-spaces',
          name: 'parking-spaces',
          component: () => import('../views/parking/ParkingSpaces.vue'),
          meta: { title: '车位管理' }
        },
        {
          path: '/fee-rules',
          name: 'fee-rules',
          component: () => import('../views/fees/FeeRules.vue'),
          meta: { title: '计费规则' }
        },
        {
          path: '/fee-records',
          name: 'fee-records',
          component: () => import('../views/fees/FeeRecords.vue'),
          meta: { title: '收费记录' }
        }
      ]
    }
  ]
})

// 添加全局前置守卫，检查登录状态
router.beforeEach((to, from, next) => {
  // 模拟检查登录状态，实际项目中应该从localStorage或Vuex/Pinia中获取
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 如果路径是根路径，直接重定向到登录页
  if (to.path === '/') {
    next('/auth')
  }
  // 如果用户未登录且访问的不是登录页，则重定向到登录页
  else if (!isLoggedIn && to.path !== '/auth') {
    next('/auth')
  } 
  // 如果用户已登录且访问登录页，则重定向到主页
  else if (isLoggedIn && to.path === '/auth') {
    next('/dashboard')
  } 
  else {
    next()
  }
})

export default router