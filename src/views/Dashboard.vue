<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Odometer, User, LocationInformation, Box, Share, SetUp, Van } from '@element-plus/icons-vue'

// 数据统计
const stats = ref([
  { id: 1, label: '总停车场数', value: 5, icon: Box, color: '#3a7bd5' },
  { id: 2, label: '总车位数', value: 500, icon: LocationInformation, color: '#00d2ff' },
  { id: 3, label: '当前使用数', value: 320, icon: LocationInformation, color: '#e6a23c' },
  { id: 4, label: '注册车辆数', value: 278, icon: Van, color: '#67c23a' }
])

// 最近停车记录
const parkingRecords = ref([
  { id: 1, time: '10:30', plateNumber: '京A12345', action: '入场', location: '停车场A', status: 'success' },
  { id: 2, time: '09:15', plateNumber: '京B67890', action: '出场', location: '停车场B', status: 'info' },
  { id: 3, time: '08:45', plateNumber: '京C54321', action: '入场', location: '停车场A', status: 'success' },
  { id: 4, time: '昨天', plateNumber: '京D98765', action: '出场', location: '停车场C', status: 'info' },
  { id: 5, time: '昨天', plateNumber: '京E13579', action: '入场', location: '停车场B', status: 'success' }
])

// 停车场占用率数据
const parkingLots = ref([
  { id: 1, name: '停车场A', capacity: 100, occupied: 75, available: 25, status: 'active' },
  { id: 2, name: '停车场B', capacity: 150, occupied: 120, available: 30, status: 'active' },
  { id: 3, name: '停车场C', capacity: 80, occupied: 50, available: 30, status: 'maintenance' },
  { id: 4, name: '停车场D', capacity: 120, occupied: 90, available: 30, status: 'active' },
  { id: 5, name: '停车场E', capacity: 50, occupied: 35, available: 15, status: 'active' }
])

onMounted(() => {
  document.title = '首页 - 停车场管理系统'
})
</script>

<template>
  <div class="app-container dashboard-container">
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <div class="page-actions">
        <el-button type="primary" size="default">系统状态</el-button>
        <el-button class="gradient-button">刷新数据</el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-container">
      <div class="stats-card" v-for="item in stats" :key="item.id">
        <div class="stats-content">
          <div class="stats-info">
            <div class="stats-label">{{ item.label }}</div>
            <div class="stats-value">{{ item.value }}</div>
          </div>
          <div class="stats-icon" :style="{ backgroundColor: item.color }">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 停车场占用率和最近停车记录 -->
    <div class="main-content">
      <div class="main-section">
        <div class="card parking-status">
          <div class="card-header">
            <h3>停车场占用率</h3>
            <el-button text>查看全部</el-button>
          </div>
          <div class="card-body">
            <div class="parking-lots">
              <div class="parking-lot-item" v-for="lot in parkingLots" :key="lot.id">
                <div class="lot-info">
                  <div class="lot-name">
                    {{ lot.name }}
                    <el-tag size="small" :type="lot.status === 'active' ? 'success' : 'warning'" effect="plain">
                      {{ lot.status === 'active' ? '正常' : '维护中' }}
                    </el-tag>
                  </div>
                  <div class="lot-status">
                    <span class="lot-capacity">{{ lot.occupied }}/{{ lot.capacity }}</span>
                    <span class="lot-available">可用: <b>{{ lot.available }}</b></span>
                  </div>
                </div>
                <el-progress 
                  :percentage="Math.round(lot.occupied / lot.capacity * 100)" 
                  :status="lot.occupied / lot.capacity > 0.9 ? 'exception' : 
                          lot.occupied / lot.capacity > 0.7 ? 'warning' : 'success'" 
                  :stroke-width="10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="side-section">
        <div class="card recent-records">
          <div class="card-header">
            <h3>最近停车记录</h3>
            <el-button text>查看全部</el-button>
          </div>
          <div class="card-body">
            <el-timeline>
              <el-timeline-item
                v-for="record in parkingRecords"
                :key="record.id"
                :type="record.status"
                :timestamp="record.time"
                :hollow="true"
                size="small"
              >
                <div class="record-content">
                  <h4>{{ record.action === '入场' ? '车辆入场' : '车辆出场' }}</h4>
                  <p>
                    <span class="plate-number">{{ record.plateNumber }}</span>
                    {{ record.action === '入场' ? '已进入' : '已离开' }}{{ record.location }}
                  </p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  padding: 0 5px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 10px;
}

/* 数据统计卡片样式 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 25px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
}

.stats-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  transition: all 0.3s;
  position: relative;
  width: 100%;
  display: block;
  box-sizing: border-box;
  height: 160px; /* 固定高度 */
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stats-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.stats-info {
  flex: 1;
}

.stats-label {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-weight: 500;
}

.stats-value {
  font-size: 42px;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1;
}

.stats-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 15px;
}

.stats-icon .el-icon {
  font-size: 34px;
}

/* 主内容区域样式 */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

.main-section, .side-section {
  width: 100%;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

.card-header {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 20px;
}

/* 停车场占用率 */
.parking-lots {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.parking-lot-item {
  padding: 10px 0;
}

.lot-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.lot-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-wrap: wrap;
}

.lot-status {
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text-secondary);
  font-size: 14px;
}

.lot-capacity {
  font-weight: 500;
}

.lot-available {
  font-weight: 500;
}

.lot-available b {
  color: var(--success-color);
  font-weight: 600;
}

/* 最近停车记录 */
.record-content h4 {
  font-size: 14px;
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.record-content p {
  font-size: 12px;
  margin: 0;
  color: var(--text-secondary);
}

.plate-number {
  font-weight: 500;
  color: var(--primary-color);
  margin-right: 4px;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .stats-container {
    gap: 25px;
  }
  
  .main-content {
    gap: 25px;
  }
}

@media (max-width: 1200px) {
  .app-container {
    gap: 25px;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
    margin-bottom: 25px;
    min-height: auto;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .stats-card {
    min-height: 110px;
    padding: 18px;
  }
  
  .stats-content {
    min-height: 75px;
  }
  
  .stats-label {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  .stats-value {
    font-size: 34px;
  }
  
  .stats-icon {
    width: 65px;
    height: 65px;
    margin-left: 10px;
  }
  
  .stats-icon .el-icon {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .app-container {
    gap: 20px;
  }
  
  .stats-container {
    margin-bottom: 20px;
  }
  
  .stats-card {
    min-height: 100px;
    padding: 15px;
  }
  
  .stats-content {
    min-height: 70px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .page-actions {
    width: 100%;
  }
  
  .page-actions .el-button {
    flex: 1;
  }
  
  .stats-label {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .stats-value {
    font-size: 30px;
  }
  
  .stats-icon {
    width: 55px;
    height: 55px;
    border-radius: 12px;
  }
  
  .stats-icon .el-icon {
    font-size: 28px;
  }
  
  .card-header {
    padding: 15px;
  }
  
  .card-body {
    padding: 15px;
  }
}

@media (max-width: 576px) {
  .app-container {
    gap: 15px;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .stats-card {
    min-height: 90px;
    padding: 12px;
  }
  
  .stats-content {
    min-height: 60px;
  }
  
  .stats-label {
    font-size: 14px;
    margin-bottom: 6px;
  }
  
  .stats-value {
    font-size: 28px;
  }
  
  .stats-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    margin-left: 10px;
  }
  
  .stats-icon .el-icon {
    font-size: 24px;
  }
}
</style>