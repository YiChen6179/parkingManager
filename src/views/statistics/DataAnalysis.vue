<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStatistics } from '@/hooks';
import { Odometer, Box, LocationInformation, Refresh, Calendar } from '@element-plus/icons-vue';

// 使用统计数据hook
const {
  loading,
  dateRange,
  totalLots,
  totalSpots,
  availableSpots,
  occupiedSpots,
  todayIncome,
  weeklyIncome,
  monthlyIncome,
  lotUtilization,
  hourlyDistribution,
  dailyIncome,
  spotsByType,
  loadAllData,
  updateDateRange
} = useStatistics();

// 当前选择的分析类型
const activeTab = ref('overview');

// 选择日期范围
const handleDateChange = (val: [Date, Date]) => {
  if (val) {
    updateDateRange(val);
  }
};

// 刷新数据
const handleRefresh = () => {
  loadAllData();
};

onMounted(() => {
  document.title = '数据分析 - 停车场管理系统';
});
</script>

<template>
  <div class="data-analysis-container">
    <div class="page-header">
      <h1 class="page-title">数据统计分析</h1>
      <div class="page-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button
          type="primary"
          :icon="Refresh"
          @click="handleRefresh"
          :loading="loading"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #3a7bd5">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalLots }}</div>
                <div class="stat-label">停车场数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #00d2ff">
                <el-icon><LocationInformation /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalSpots }}</div>
                <div class="stat-label">停车位总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #67c23a">
                <el-icon><LocationInformation /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ availableSpots }}</div>
                <div class="stat-label">可用车位</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #e6a23c">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ todayIncome }}</div>
                <div class="stat-label">今日收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分析标签页 -->
    <el-card class="analysis-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="收入分析" name="income">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else>
            <div class="income-overview">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="income-item">
                    <div class="income-title">今日收入</div>
                    <div class="income-value primary">¥{{ todayIncome }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="income-item">
                    <div class="income-title">本周收入</div>
                    <div class="income-value success">¥{{ weeklyIncome }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="income-item">
                    <div class="income-title">本月收入</div>
                    <div class="income-value warning">¥{{ monthlyIncome }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <div class="income-chart-section">
              <h3 class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>日收入趋势</span>
              </h3>
              <div class="chart-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>收入 (元)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in dailyIncome" :key="item.date">
                      <td>{{ item.date }}</td>
                      <td>¥{{ item.income }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="利用率分析" name="utilization">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else>
            <div class="utilization-section">
              <h3 class="section-title">
                <el-icon><Box /></el-icon>
                <span>停车场利用率</span>
              </h3>
              <div class="chart-container">
                <el-table :data="lotUtilization" border stripe>
                  <el-table-column label="停车场名称" prop="name" min-width="180" />
                  <el-table-column label="总车位数" prop="total" width="100" />
                  <el-table-column label="已占用" prop="occupied" width="100" />
                  <el-table-column label="利用率" width="200">
                    <template #default="{ row }">
                      <div class="utilization-bar">
                        <el-progress 
                          :percentage="row.utilization" 
                          :status="row.utilization > 80 ? 'exception' : 
                                   row.utilization > 60 ? 'warning' : 'success'" 
                          :stroke-width="15"
                          :format="(p: number) => p + '%'"
                        />
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            
            <div class="hourly-distribution-section">
              <h3 class="section-title">
                <el-icon><Odometer /></el-icon>
                <span>按小时分布的停车记录</span>
              </h3>
              <div class="chart-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>时间段</th>
                      <th>停车记录数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in hourlyDistribution" :key="item.hour">
                      <td>{{ item.hour }}</td>
                      <td>{{ item.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="车位分析" name="spots">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else>
            <div class="spots-section">
              <h3 class="section-title">
                <el-icon><LocationInformation /></el-icon>
                <span>车位类型分布</span>
              </h3>
              <div class="chart-container">
                <el-table :data="spotsByType" border stripe>
                  <el-table-column label="车位类型" prop="label" min-width="180" />
                  <el-table-column label="数量" prop="count" width="120" />
                  <el-table-column label="占比" width="200">
                    <template #default="{ row }">
                      <div class="utilization-bar">
                        <el-progress 
                          :percentage="Math.round((row.count / totalSpots) * 100)" 
                          :stroke-width="15"
                          :format="(p: number) => p + '%'"
                        />
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            
            <div class="spots-status-section">
              <h3 class="section-title">
                <el-icon><Odometer /></el-icon>
                <span>车位状态统计</span>
              </h3>
              <div class="spots-status-stats">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-card class="stats-card">
                      <div class="stats-header">
                        <span>可用车位</span>
                        <span class="stats-value success">{{ availableSpots }}</span>
                      </div>
                      <el-progress 
                        :percentage="Math.round((availableSpots / totalSpots) * 100)" 
                        status="success"
                        :stroke-width="20"
                        :format="(p: number) => p + '%'"
                      />
                    </el-card>
                  </el-col>
                  <el-col :span="12">
                    <el-card class="stats-card">
                      <div class="stats-header">
                        <span>已占用车位</span>
                        <span class="stats-value danger">{{ occupiedSpots }}</span>
                      </div>
                      <el-progress 
                        :percentage="Math.round((occupiedSpots / totalSpots) * 100)" 
                        status="exception"
                        :stroke-width="20"
                        :format="(p: number) => p + '%'"
                      />
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.data-analysis-container {
  padding: 10px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 10px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.stat-icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.analysis-card {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
  margin: 20px 0;
  color: var(--text-primary);
}

.chart-container {
  margin: 20px 0;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}

.loading-container {
  padding: 20px;
}

.income-overview {
  margin: 20px 0;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.income-item {
  text-align: center;
  padding: 20px;
}

.income-title {
  font-size: 16px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.income-value {
  font-size: 28px;
  font-weight: 600;
}

.income-value.primary {
  color: var(--primary-color);
}

.income-value.success {
  color: var(--success-color);
}

.income-value.warning {
  color: var(--warning-color);
}

.income-chart-section,
.utilization-section,
.hourly-distribution-section,
.spots-section,
.spots-status-section {
  margin-top: 30px;
}

.utilization-bar {
  width: 100%;
}

.spots-status-stats {
  margin-top: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stats-value {
  font-size: 20px;
  font-weight: 600;
}

.stats-value.success {
  color: var(--success-color);
}

.stats-value.danger {
  color: var(--danger-color);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.data-table thead tr {
  background-color: #f5f7fa;
}

.data-table tbody tr:hover {
  background-color: #f5f7fa;
}
</style> 