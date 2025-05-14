<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { ParkingSpotVO } from '@/api/parkingSpot'

const props = defineProps<{
  loading: boolean,
  parkingSpotList: ParkingSpotVO[],
  total: number,
  currentPage: number,
  pageSize: number,
  parkingZoneOptions: { label: string; value: number; lotId: number }[],
  parkingLotOptions: { label: string; value: number }[]
}>()

const emit = defineEmits<{
  (e: 'edit', row: ParkingSpotVO): void;
  (e: 'delete', row: ParkingSpotVO): void;
  (e: 'current-change', page: number): void;
  (e: 'size-change', size: number): void;
}>()

// 获取停车区名称和所属停车场
const getZoneInfo = (zoneId: number) => {
  const zone = props.parkingZoneOptions.find(item => item.value === zoneId)
  if (!zone) return { zoneName: '-', lotName: '-' }
  
  const lot = props.parkingLotOptions.find(item => item.value === zone.lotId)
  return {
    zoneName: zone.label,
    lotName: lot ? lot.label : '-'
  }
}

// 获取车位状态
const getStatusText = (status: number) => {
  return status === 0 ? '空闲' : '占用'
}

// 获取车位状态类型
const getStatusType = (status: number) => {
  return status === 0 ? 'success' : 'danger'
}

// 处理编辑按钮点击
const handleEdit = (row: ParkingSpotVO) => {
  emit('edit', row)
}

// 处理删除按钮点击
const handleDelete = (row: ParkingSpotVO) => {
  emit('delete', row)
}

// 分页变化
const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<template>
  <el-card class="list-card">
    <div class="action-header">
      <span class="title">停车位列表</span>
      <slot name="action"></slot>
    </div>
    
    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="parkingSpotList"
      style="width: 100%"
      border
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="所属停车场" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ getZoneInfo(row.parkingZoneId).lotName }}
        </template>
      </el-table-column>
      <el-table-column label="所属停车区" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ getZoneInfo(row.parkingZoneId).zoneName }}
        </template>
      </el-table-column>
      <el-table-column prop="spotNumber" label="车位编号" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status || 0)">
            {{ getStatusText(row.status || 0) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="尺寸" width="120" align="center">
        <template #default="{ row }">
          {{ row.length }}m × {{ row.width }}m
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      class="pagination"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-card>
</template>

<style scoped>
.list-card {
  margin-bottom: 20px;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-header .title {
  font-size: 18px;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 