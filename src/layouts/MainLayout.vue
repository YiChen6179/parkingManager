<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu as IconMenu,
  Location,
  Document,
  Setting,
  HomeFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)
const isHomePage = ref(window.location.pathname === '/' || window.location.pathname === '')

// 监听路由变化，更新isHomePage状态
router.afterEach((to) => {
  isHomePage.value = to.path === '/'
})

const handleSelect = (key: string) => {
  router.push(key)
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><home-filled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/parking-lots">
          <el-icon><location /></el-icon>
          <template #title>停车场管理</template>
        </el-menu-item>
        <el-menu-item index="/parking-spaces">
          <el-icon><document /></el-icon>
          <template #title>车位管理</template>
        </el-menu-item>
        <el-menu-item index="/fee-rules">
          <el-icon><setting /></el-icon>
          <template #title>计费规则</template>
        </el-menu-item>
        <el-menu-item index="/fee-records">
          <el-icon><setting /></el-icon>
          <template #title>收费记录</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <el-button type="text" @click="isCollapse = !isCollapse">
            <el-icon><icon-menu /></el-icon>
          </el-button>
          <h2>停车管理系统</h2>
        </div>
      </el-header>
      <el-main :class="{'hide-scrollbar': isHomePage}" class="rr-view">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>

.layout-container {
  height: 100vh;
}

.el-aside {
  transition: width 0.3s;
}

.el-menu-vertical {
  border-right: none;
  height: 100%;
}

.el-menu-vertical .el-menu-item {
  display: flex;
  align-items: center;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 当在首页时隐藏滚动条 */
:deep(.el-main.hide-scrollbar) {
  overflow-y: hidden;
}
</style>