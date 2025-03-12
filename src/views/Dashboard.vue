<script setup lang="ts">
import { ref } from 'vue'
import { Location, Tickets, Select, Money } from '@element-plus/icons-vue'

const statistics = ref({
  totalParkingLots: 5,
  totalParkingSpaces: 500,
  availableSpaces: 320,
  todayIncome: 8888
})

// 获取当前时间
const currentTime = ref(new Date())
const hours = currentTime.value.getHours()
let greeting = '您好'

if (hours < 12) {
  greeting = '早上好'
} else if (hours < 18) {
  greeting = '下午好'
} else {
  greeting = '晚上好'
}
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎信息 -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <h2>{{ greeting }}，管理员</h2>
        <p>欢迎使用停车场管理系统简洁版</p>
        <p class="welcome-desc">本版本移除了所有图表，提供更简洁的界面和更快的加载速度</p>
      </div>
    </el-card>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总停车场数</span>
              <el-icon><Location /></el-icon>
            </div>
          </template>
          <div class="card-value">
            {{ statistics.totalParkingLots }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总车位数</span>
              <el-icon><Tickets /></el-icon>
            </div>
          </template>
          <div class="card-value">
            {{ statistics.totalParkingSpaces }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>可用车位数</span>
              <el-icon><Select /></el-icon>
            </div>
          </template>
          <div class="card-value success">
            {{ statistics.availableSpaces }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日收入</span>
              <el-icon><Money /></el-icon>
            </div>
          </template>
          <div class="card-value primary">
            ¥{{ statistics.todayIncome }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统信息</span>
        </div>
      </template>
      <div class="info-content">
        <p><strong>版本：</strong> 简洁版 1.0.0</p>
        <p><strong>更新时间：</strong> {{ new Date().toLocaleDateString() }}</p>
        <p><strong>说明：</strong> 此版本移除了所有图表组件，适合对性能要求较高的环境</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.welcome-card {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 4px;
  transition: all 0.3s;
}

.welcome-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  padding: 10px 0;
}

.welcome-content h2 {
  margin-top: 0;
  color: #303133;
  font-size: 24px;
}

.welcome-desc {
  color: #909399;
  margin-top: 10px;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 4px;
  transition: all 0.3s;
  height: 150px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-top: 15px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-value.success {
  color: #67c23a;
}

.card-value.primary {
  color: #409eff;
}

.info-card {
  background-color: #fff;
  border-radius: 4px;
  transition: all 0.3s;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.info-content {
  line-height: 1.8;
  color: #606266;
}
</style>