import { createRouter, createWebHistory } from 'vue-router'
import authUtils from '@/utils/auth'
import { ROUTE_PATHS, ROUTE_NAMES } from '@/constants'
import { STORAGE_KEYS } from '@/constants'

// 定义路由元数据类型
interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
}

// 扩展Vue Router的RouteMeta接口
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: ROUTE_PATHS.ROOT,
      redirect: ROUTE_PATHS.AUTH
    },
    {
      path: ROUTE_PATHS.AUTH,
      name: ROUTE_NAMES.AUTH,
      component: () => import('../views/Auth.vue'),
      meta: { title: '登录/注册', requiresAuth: false }
    },
    {
      path: '/main',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: ROUTE_PATHS.DASHBOARD,
          name: ROUTE_NAMES.DASHBOARD,
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        // 停车场管理
        {
          path: ROUTE_PATHS.PARKING_LOTS,
          name: ROUTE_NAMES.PARKING_LOTS,
          component: () => import('../views/parking/ParkingLots.vue'),
          meta: { title: '停车场管理', requiresAuth: true }
        },
        // 停车区管理
        {
          path: ROUTE_PATHS.PARKING_ZONES,
          name: ROUTE_NAMES.PARKING_ZONES,
          component: () => import('../views/parking/ParkingZones.vue'),
          meta: { title: '停车区管理', requiresAuth: true }
        },
        // 停车位管理
        {
          path: ROUTE_PATHS.PARKING_SPOTS,
          name: ROUTE_NAMES.PARKING_SPOTS,
          component: () => import('../views/parking/ParkingSpots.vue'),
          meta: { title: '停车位管理', requiresAuth: true }
        },
        // 停车位实时监控
        {
          path: ROUTE_PATHS.SPOT_MONITOR,
          name: ROUTE_NAMES.SPOT_MONITOR,
          component: () => import('../views/parking/SpotMonitor.vue'),
          meta: { title: '停车位监控', requiresAuth: true }
        },
        // 数据统计分析
        {
          path: ROUTE_PATHS.DATA_ANALYSIS,
          name: ROUTE_NAMES.DATA_ANALYSIS,
          component: () => import('../views/statistics/DataAnalysis.vue'),
          meta: { title: '数据分析', requiresAuth: true }
        },
        // 停车记录管理
        {
          path: ROUTE_PATHS.PARKING_RECORDS,
          name: ROUTE_NAMES.PARKING_RECORDS,
          component: () => import('../views/parking/ParkingRecords.vue'),
          meta: { title: '停车记录', requiresAuth: true }
        },
        // 用户管理
        {
          path: ROUTE_PATHS.USERS,
          name: ROUTE_NAMES.USERS,
          component: () => import('../views/user/Users.vue'),
          meta: { title: '用户管理', requiresAuth: true }
        },
        // 车辆管理
        {
          path: ROUTE_PATHS.VEHICLES,
          name: ROUTE_NAMES.VEHICLES,
          component: () => import('../views/vehicle/Vehicles.vue'),
          meta: { title: '车辆管理', requiresAuth: true }
        }
      ]
    },
    // 404页面
    {
      path: '/:pathMatch(.*)*',
      name: ROUTE_NAMES.NOT_FOUND,
      component: () => import('../views/NotFound.vue'),
      meta: { title: '页面不存在', requiresAuth: false }
        }
      ]
})

// 在应用启动时初始化认证状态
authUtils.initializeAuth();

// 添加全局前置守卫，处理认证和授权
router.beforeEach((to, from, next) => {
  console.log(`路由变化: 从 ${from.path} 到 ${to.path}`);
  
  // 检查存储中的登录状态和token
  const localLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  const sessionLoggedIn = sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  const localToken = !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  const sessionToken = !!sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  
  // 判断页面是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
  
  // 使用认证工具检查登录状态
  const isAuthenticated = authUtils.checkIsLoggedIn();
  
  console.log(`路由守卫: 路径=${to.path}, localStorage登录=${localLoggedIn}, sessionStorage登录=${sessionLoggedIn}, localToken=${localToken}, sessionToken=${sessionToken}, 认证状态=${isAuthenticated}`);
  
  // 处理根路径
  if (to.path === ROUTE_PATHS.ROOT) {
    next(ROUTE_PATHS.AUTH);
    return;
  }
  
  // 如果需要认证但未认证，重定向到登录页
  if (requiresAuth && !isAuthenticated) {
    console.log('需要认证但未登录，重定向到登录页');
    next(ROUTE_PATHS.AUTH);
    return;
  }
  
  // 如果已认证但访问登录页，重定向到首页
  if (isAuthenticated && to.path === ROUTE_PATHS.AUTH) {
    console.log('已登录但访问登录页，重定向到首页');
    next(ROUTE_PATHS.DASHBOARD);
    return;
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 停车场管理系统`;
  } else {
    document.title = '停车场管理系统';
  }
  
  // 允许访问请求的页面
  next();
});

export default router