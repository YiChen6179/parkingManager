<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Location, Tickets, Select, Money } from '@element-plus/icons-vue'

const statistics = ref({
  totalParkingLots: 5,
  totalParkingSpaces: 500,
  availableSpaces: 320,
  todayIncome: 8888
})

/* 停车场数据 */
const parkingLotData = ref([
  { name: '中心广场停车场', value: 200, available: 150 },
  { name: '商业街停车场', value: 150, available: 80 },
  { name: '东区停车场', value: 100, available: 60 },
  { name: '西区停车场', value: 50, available: 30 }
])

/* 每日收入数据 */
const incomeData = ref([
  { date: '周一', value: 5200 },
  { date: '周二', value: 5800 },
  { date: '周三', value: 6500 },
  { date: '周四', value: 7200 },
  { date: '周五', value: 8500 },
  { date: '周六', value: 9800 },
  { date: '周日', value: 8800 }
])

/* 车流量数据 */
const trafficData = ref([
  { date: '周一', entry: 320, exit: 280 },
  { date: '周二', entry: 350, exit: 310 },
  { date: '周三', entry: 380, exit: 350 },
  { date: '周四', entry: 420, exit: 390 },
  { date: '周五', entry: 520, exit: 480 },
  { date: '周六', entry: 620, exit: 580 },
  { date: '周日', entry: 550, exit: 520 }
])

/* 初始化图表 */
onMounted(() => {
  initParkingSpaceChart()
  initIncomeChart()
  initTrafficChart()
  initOccupancyGauge()
})

/* 初始化车位占用饼图 */
const initParkingSpaceChart = () => {
  const chartDom = document.getElementById('parking-space-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '车位占用情况',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 0,
      bottom:0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      },
      data: parkingLotData.value.map(item => item.name)
    },
    series: [
      {
        name: '车位情况',
        type: 'pie',
        radius: '50%',
        center: ['60%', '50%'],
        data: parkingLotData.value.map(item => ({
          name: item.name,
          value: item.value - item.available
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  myChart.setOption(option)
}

/* 初始化收入图表 */
const initIncomeChart = () => {
  const chartDom = document.getElementById('income-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '每日收入统计',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 50,
      bottom: 30,
      left: 40,
      right: 20,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: incomeData.value.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: incomeData.value.map(item => item.value),
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ]
  }
  
  myChart.setOption(option)
}

/* 初始化车流量图表 */
const initTrafficChart = () => {
  const chartDom = document.getElementById('traffic-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '车流量统计',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 50,
      bottom: 50,
      left: 40,
      right: 20,
      containLabel: true
    },
    legend: {
      data: ['入场', '出场'],
      bottom: 10,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    xAxis: {
      type: 'category',
      data: trafficData.value.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入场',
        type: 'line',
        data: trafficData.value.map(item => item.entry),
        smooth: true
      },
      {
        name: '出场',
        type: 'line',
        data: trafficData.value.map(item => item.exit),
        smooth: true
      }
    ]
  }
  
  myChart.setOption(option)
}

/* 初始化占用率仪表盘 */
const initOccupancyGauge = () => {
  const chartDom = document.getElementById('occupancy-gauge')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const occupancyRate = Math.round((statistics.value.totalParkingSpaces - statistics.value.availableSpaces) / statistics.value.totalParkingSpaces * 100)
  
  const option = {
    title: {
      text: '车位占用率',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    grid: {
      top: 40,
      bottom: 20,
      containLabel: true
    },
    series: [
      {
        name: '占用率',
        type: 'gauge',
        radius: '80%',
        center: ['50%', '60%'],
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          fontSize: 16,
          offsetCenter: [0, '60%']
        },
        data: [
          {
            value: occupancyRate,
            name: '占用率',
            title: {
              fontSize: 12
            }
          }
        ]
      }
    ]
  }
  
  myChart.setOption(option)
}
</script>

<template>
  <div class="dashboard">
    <!-- 统计卡片和饼图区域 -->
    <el-row :gutter="20" class="stat-charts-row">
      <!-- 左侧统计卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-row :gutter="20">
          <el-col :span="12">
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
          <el-col :span="12">
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
        </el-row>
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="12">
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
          <el-col :span="12">
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
      </el-col>
      
      <!-- 右侧饼图 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover" class="chart-card">
              <div id="parking-space-chart" class="chart"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover" class="chart-card">
              <div id="occupancy-gauge" class="chart"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    
    <!-- 柱状图和折线图区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="chart-card">
          <div id="income-chart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="chart-card">
          <div id="traffic-chart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 15px;
  background-color: #f5f7fa;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.stat-charts-row {
  margin-bottom: 15px;
}

.stat-card {
  background-color: #fff;
  border-radius: 4px;
  transition: all 0.3s;
  height: 150px;
  display: flex;
  flex-direction: column;
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

.chart-row {
  margin-bottom: 15px;
}

.chart-card {
  height: 320px;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.chart {
  height: 280px;
  width: 100%;
}

.chart-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 0;
}
</style>