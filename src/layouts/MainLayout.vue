<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
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
  <div class="main-layout">
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
            <el-dropdown>
              <span class="user-dropdown">
                {{ username }} <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #263445;
}

.logo {
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}

.logo-small {
  font-size: 20px;
  margin: 0;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.main {
  background-color: #f0f2f5;
  padding: 0;
  overflow: auto;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: #909399;
  cursor: pointer;
  padding: 8px 0;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>