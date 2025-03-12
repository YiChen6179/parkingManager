import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'parking-lots',
          name: 'parking-lots',
          component: () => import('../views/parking/ParkingLots.vue'),
          meta: { title: '停车场管理' }
        },
        {
          path: 'parking-spaces',
          name: 'parking-spaces',
          component: () => import('../views/parking/ParkingSpaces.vue'),
          meta: { title: '车位管理' }
        },
        {
          path: 'fee-rules',
          name: 'fee-rules',
          component: () => import('../views/fees/FeeRules.vue'),
          meta: { title: '计费规则' }
        },
        {
          path: 'fee-records',
          name: 'fee-records',
          component: () => import('../views/fees/FeeRecords.vue'),
          meta: { title: '收费记录' }
        }
      ]
    }
  ]
})

export default router