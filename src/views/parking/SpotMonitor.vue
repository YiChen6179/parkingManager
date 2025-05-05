<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSpotMonitor } from '@/hooks';
import { Odometer, Box, LocationInformation, SetUp, Warning, Loading } from '@element-plus/icons-vue';

// 初始化停车位监控hook
const {
  parkingLots,
  parkingZones,
  parkingSpots,
  selectedLotId,
  selectedZoneId,
  loading,
  autoRefresh,
  refreshRate,
  spotsInSelectedLot,
  spotsInSelectedZone,
  spotStats,
  selectParkingLot,
  selectParkingZone,
  refreshData,
  toggleAutoRefresh,
  setRefreshRate
} = useSpotMonitor();

// 显示模式
const displayMode = ref<'list' | 'grid'>('grid');

// 视图排序方式
const sortBy = ref<'name' | 'status'>('name');

// 状态筛选器
const statusFilter = ref<string[]>([]);

// 搜索关键词
const searchKeyword = ref('');

// 切换显示模式
const changeDisplayMode = (mode: 'list' | 'grid') => {
  displayMode.value = mode;
};

// 切换排序方式
const changeSortBy = (sort: 'name' | 'status') => {
  sortBy.value = sort;
};

// 刷新频率选项
const refreshRateOptions = [
  { label: '10秒', value: 10 },
  { label: '30秒', value: 30 },
  { label: '1分钟', value: 60 },
  { label: '5分钟', value: 300 }
];

// 停车位状态映射
const spotStatusMap = {
  'available': { text: '空闲', color: '#67C23A', icon: Odometer },
  'occupied': { text: '已占用', color: '#F56C6C', icon: Box },
  'reserved': { text: '已预约', color: '#E6A23C', icon: LocationInformation },
  'maintenance': { text: '维护中', color: '#909399', icon: SetUp }
};

// 过滤后的停车位列表
const filteredSpots = computed(() => {
  // 显示选中停车场或停车区的停车位
  let spots = selectedZoneId.value 
    ? spotsInSelectedZone.value
    : (selectedLotId.value ? spotsInSelectedLot.value : parkingSpots.value);
  
  // 应用状态筛选
  if (statusFilter.value.length > 0) {
    spots = spots.filter(spot => statusFilter.value.includes(spot.status));
  }
  
  // 应用搜索关键词
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    spots = spots.filter(spot => 
      spot.spotNumber.toLowerCase().includes(keyword) ||
      (spot.parkingZoneName && spot.parkingZoneName.toLowerCase().includes(keyword)) ||
      (spot.parkingLotName && spot.parkingLotName.toLowerCase().includes(keyword))
    );
  }
  
  // 应用排序
  spots = [...spots].sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.spotNumber.localeCompare(b.spotNumber);
    } else { // status
      return a.status.localeCompare(b.status);
    }
  });
  
  return spots;
});

// 获取状态的颜色
const getStatusColor = (status: string) => {
  return spotStatusMap[status as keyof typeof spotStatusMap]?.color || '#909399';
};

// 获取状态的文本
const getStatusText = (status: string) => {
  return spotStatusMap[status as keyof typeof spotStatusMap]?.text || status;
};

// 获取状态的图标
const getStatusIcon = (status: string) => {
  return spotStatusMap[status as keyof typeof spotStatusMap]?.icon;
};

// 当状态筛选器变化时刷新
watch(statusFilter, () => {
  refreshData();
}, { deep: true });
</script>

<template>
  <div class="spot-monitor-container">
    <div class="page-header">
      <h1 class="page-title">停车位实时监控</h1>
      <div class="page-actions">
        <el-button
          type="primary"
          :icon="Odometer"
          @click="refreshData"
          :loading="loading"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 筛选器和控制面板 -->
    <el-card class="filter-panel">
      <div class="panel-header">
        <div class="panel-title">控制面板</div>
        <div class="refresh-control">
          <span class="refresh-label">自动刷新:</span>
          <el-switch v-model="autoRefresh" @change="toggleAutoRefresh" />
          <el-select
            v-model="refreshRate"
            size="small"
            @change="setRefreshRate"
            :disabled="!autoRefresh"
            style="width: 100px; margin-left: 10px;"
          >
            <el-option
              v-for="option in refreshRateOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </div>
      
      <el-divider />
      
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item location-filter">
            <el-select
              v-model="selectedLotId"
              placeholder="选择停车场"
              clearable
              filterable
              @change="selectParkingLot"
              style="width: 100%;"
            >
              <el-option
                v-for="lot in parkingLots"
                :key="lot.id"
                :label="lot.name"
                :value="lot.id"
              />
            </el-select>
          </div>
          
          <div class="filter-item location-filter">
            <el-select
              v-model="selectedZoneId"
              placeholder="选择停车区"
              clearable
              filterable
              @change="selectParkingZone"
              style="width: 100%;"
              :disabled="!selectedLotId"
            >
              <el-option
                v-for="zone in parkingZones"
                :key="zone.id"
                :label="zone.name"
                :value="zone.id"
              />
            </el-select>
          </div>
          
          <div class="filter-item search-filter">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索停车位"
              clearable
              prefix-icon="Search"
            />
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-item status-filter">
            <el-checkbox-group v-model="statusFilter">
              <el-checkbox-button label="available">
                <el-icon><component :is="getStatusIcon('available')" /></el-icon>
                空闲
              </el-checkbox-button>
              <el-checkbox-button label="occupied">
                <el-icon><component :is="getStatusIcon('occupied')" /></el-icon>
                已占用
              </el-checkbox-button>
              <el-checkbox-button label="reserved">
                <el-icon><component :is="getStatusIcon('reserved')" /></el-icon>
                已预约
              </el-checkbox-button>
              <el-checkbox-button label="maintenance">
                <el-icon><component :is="getStatusIcon('maintenance')" /></el-icon>
                维护中
              </el-checkbox-button>
            </el-checkbox-group>
          </div>
          
          <div class="filter-item view-control">
            <el-radio-group v-model="displayMode" size="small">
              <el-radio-button label="grid">网格视图</el-radio-button>
              <el-radio-button label="list">列表视图</el-radio-button>
            </el-radio-group>
            
            <el-select
              v-model="sortBy"
              size="small"
              style="width: 120px; margin-left: 10px;"
            >
              <el-option label="按名称排序" value="name" />
              <el-option label="按状态排序" value="status" />
            </el-select>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 统计信息卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #409EFF">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ spotStats.total }}</div>
                <div class="stat-label">总车位数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #67C23A">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ spotStats.available }}</div>
                <div class="stat-label">空闲车位</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #F56C6C">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ spotStats.occupied }}</div>
                <div class="stat-label">已占用车位</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #E6A23C">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ spotStats.reserved + spotStats.maintenance }}</div>
                <div class="stat-label">预约/维护</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 停车位展示区 -->
    <div class="spots-display">
      <el-card v-if="loading" class="loading-card">
        <el-empty description="加载中..." :image-size="100">
          <template #image>
            <el-icon size="60"><Loading /></el-icon>
          </template>
        </el-empty>
      </el-card>
      
      <el-card v-else-if="filteredSpots.length === 0" class="empty-card">
        <el-empty description="没有找到符合条件的停车位" />
      </el-card>
      
      <template v-else>
        <!-- 列表视图 -->
        <el-card v-if="displayMode === 'list'" class="spots-list-container">
          <el-table
            :data="filteredSpots"
            style="width: 100%"
            border
            stripe
            :height="500"
          >
            <el-table-column label="停车位编号" prop="spotNumber" min-width="120" />
            <el-table-column label="停车场" prop="parkingLotName" min-width="150" />
            <el-table-column label="停车区" prop="parkingZoneName" min-width="150" />
            <el-table-column label="类型" prop="type" min-width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">
                  {{ row.type === 'standard' ? '标准' : 
                     row.type === 'handicapped' ? '残障' : 
                     row.type === 'electric' ? '电动' : '紧凑' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" min-width="120">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="row.status === 'available' ? 'success' :
                         row.status === 'occupied' ? 'danger' :
                         row.status === 'reserved' ? 'warning' : 'info'"
                >
                  <el-icon><component :is="getStatusIcon(row.status)" /></el-icon>
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" prop="updatedAt" min-width="180" />
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="$router.push(`/main/parking-records?spotId=${row.id}`)"
                >
                  查看记录
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 网格视图 -->
        <div v-else class="spots-grid-container">
          <el-row :gutter="10">
            <el-col
              v-for="spot in filteredSpots"
              :key="spot.id"
              :xs="12"
              :sm="8"
              :md="6"
              :lg="4"
              :xl="3"
            >
              <el-card
                class="spot-card"
                shadow="hover"
                :body-style="{ padding: '10px' }"
              >
                <div class="spot-card-header">
                  <div
                    class="spot-status-indicator"
                    :style="{ backgroundColor: getStatusColor(spot.status) }"
                  ></div>
                  <div class="spot-number">{{ spot.spotNumber }}</div>
                </div>
                
                <div class="spot-card-body">
                  <div class="spot-info">
                    <div class="spot-location">
                      <div class="spot-lot">{{ spot.parkingLotName }}</div>
                      <div class="spot-zone">{{ spot.parkingZoneName }}</div>
                    </div>
                    
                    <div class="spot-status">
                      <el-icon :color="getStatusColor(spot.status)">
                        <component :is="getStatusIcon(spot.status)" />
                      </el-icon>
                      <span>{{ getStatusText(spot.status) }}</span>
                    </div>
                  </div>
                  
                  <div class="spot-type">
                    <el-tag size="small" effect="plain">
                      {{ spot.type === 'standard' ? '标准' : 
                         spot.type === 'handicapped' ? '残障' : 
                         spot.type === 'electric' ? '电动' : '紧凑' }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="spot-card-footer">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="$router.push(`/main/parking-records?spotId=${spot.id}`)"
                  >
                    查看记录
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.spot-monitor-container {
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

.filter-panel {
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
}

.refresh-control {
  display: flex;
  align-items: center;
}

.refresh-label {
  margin-right: 10px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.location-filter {
  max-width: 300px;
}

.status-filter {
  flex: 3;
}

.view-control {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.stat-cards {
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

.spots-display {
  margin-top: 20px;
}

.loading-card,
.empty-card {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spots-list-container {
  margin-bottom: 20px;
}

.spots-grid-container {
  margin-bottom: 20px;
}

.spot-card {
  margin-bottom: 15px;
  transition: transform 0.2s;
}

.spot-card:hover {
  transform: translateY(-5px);
}

.spot-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.spot-status-indicator {
  width: 8px;
  height: 30px;
  border-radius: 4px;
  margin-right: 10px;
}

.spot-number {
  font-size: 18px;
  font-weight: 600;
}

.spot-card-body {
  padding: 5px 0;
}

.spot-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.spot-location {
  display: flex;
  flex-direction: column;
}

.spot-lot {
  font-size: 14px;
  color: var(--text-primary);
}

.spot-zone {
  font-size: 12px;
  color: var(--text-secondary);
}

.spot-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.spot-type {
  margin-bottom: 10px;
}

.spot-card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-light);
  padding-top: 10px;
  margin-top: 5px;
}
</style>