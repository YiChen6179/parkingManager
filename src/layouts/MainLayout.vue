<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Odometer, 
  User, 
  List, 
  LocationInformation, 
  Box,
  Menu, 
  Share,
  SetUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { useAuth } from '@/hooks'

const router = useRouter()
const activeMenu = computed(() => router.currentRoute.value.path)
const isCollapse = ref(false)

// 判断是否是仪表盘页面
const isDashboardPage = computed(() => router.currentRoute.value.path === '/dashboard')

// 使用认证hook
const { currentUser, handleLogout, checkAuthAndRedirect } = useAuth()

// 计算用户名显示
const username = computed(() => {
  return currentUser.value?.username || '管理员';
});

// 定期检查登录状态
let checkInterval: number | null = null

onMounted(() => {
  console.log('MainLayout组件挂载');
  
  // 初始检查登录状态
  checkAuthAndRedirect();
  
  // 设置定期检查（每30秒）
  checkInterval = window.setInterval(() => {
    checkAuthAndRedirect();
  }, 30000);
});

onBeforeUnmount(() => {
  // 清除定时器
  if (checkInterval !== null) {
    clearInterval(checkInterval);
  }
});
</script>

<template>
  <div class="main-layout" :class="{ 'dashboard-page': isDashboardPage }">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="auto" class="aside">
        <div class="logo-container">
          <h1 class="logo" v-if="!isCollapse">停车场管理系统</h1>
          <h1 class="logo-small" v-else>停</h1>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="menu"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#ffffff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Menu /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>停车场管理</span>
            </template>
            <el-menu-item index="/parking-lots">
              <el-icon><List /></el-icon>
              <span>停车场列表</span>
            </el-menu-item>
            <el-menu-item index="/parking-zones">
              <el-icon><Share /></el-icon>
              <span>停车区管理</span>
            </el-menu-item>
            <el-menu-item index="/parking-spots">
              <el-icon><SetUp /></el-icon>
              <span>停车位管理</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/parking-records">
            <el-icon><Odometer /></el-icon>
            <template #title>停车记录</template>
          </el-menu-item>
          
          <el-menu-item index="/vehicles">
            <el-icon><LocationInformation /></el-icon>
            <template #title>车辆管理</template>
          </el-menu-item>
          
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
        </el-menu>
        
        <div class="collapse-btn" @click="isCollapse = !isCollapse">
          <el-icon v-if="isCollapse"><ArrowRight /></el-icon>
          <el-icon v-else><ArrowLeft /></el-icon>
        </div>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <h2>{{ router.currentRoute.value.meta.title }}</h2>
          </div>
          <div class="header-right">
            <div class="user-info">
              <el-avatar :size="32" class="avatar">{{ username.charAt(0).toUpperCase() }}</el-avatar>
              <el-dropdown trigger="click">
                <span class="user-dropdown">
                  {{ username }} <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-icon><User /></el-icon>
                      <span>个人中心</span>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-icon><SetUp /></el-icon>
                      <span>系统设置</span>
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">
                      <el-icon style="color: var(--danger-color);"><Share /></el-icon>
                      <span style="color: var(--danger-color);">退出登录</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100%;
}

.layout-container {
  height: 100%;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #263445;
  overflow: hidden;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  color: white;
  letter-spacing: 1px;
}

.logo-small {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.menu {
  border-right: none;
  height: calc(100% - 100px);
}

.header {
  background-color: #fff;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  position: relative;
  padding-left: 15px;
}

.header-left h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 2px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-primary);
  padding: 0 10px;
  transition: all 0.3s;
}

.user-dropdown:hover {
  color: var(--primary-color);
}

.main {
  background-color: #f5f7fa;
  padding: 0;
  overflow: auto;
  height: calc(100vh - 60px);
}

.collapse-btn {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  text-align: center;
  color: #bfcbd9;
  cursor: pointer;
  padding: 8px 0;
  background-color: #263445;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.el-menu-item.is-active {
  background-color: #263445 !important;
}

/* 添加菜单项悬停效果 */
.el-menu-item:hover {
  background-color: #263445 !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #fff !important;
}

:deep(.el-menu--inline) {
  background-color: #1f2d3d !important;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 5px;
}
</style>