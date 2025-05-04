<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from '@/constants';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push(ROUTE_PATHS.DASHBOARD);
};
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <p class="error-desc">抱歉，您访问的页面不存在或已被删除</p>
      <div class="action-buttons">
        <el-button @click="goBack">返回上一页</el-button>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 500px;
  text-align: center;
  padding: 40px 0;
}

.not-found-content {
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1.2;
  margin-bottom: 20px;
}

.error-message {
  font-size: 36px;
  color: #303133;
  margin-bottom: 20px;
}

.error-desc {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style> 