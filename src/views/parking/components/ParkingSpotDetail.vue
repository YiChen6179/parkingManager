<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { ParkingSpotVO } from '@/api/parkingSpot'

const props = defineProps<{
  spot: ParkingSpotVO,
  zoneInfo: { 
    zoneName: string,
    lotName: string
  }
}>()

// 获取车位状态
const statusText = computed(() => {
  return props.spot.status === 0 ? '空闲' : '占用'
})

// 获取车位状态类型
const statusType = computed(() => {
  return props.spot.status === 0 ? 'success' : 'danger'
})
</script>

<template>
  <el-descriptions
    class="margin-top"
    title="停车位详情"
    :column="2"
    border
  >
    <el-descriptions-item label="所属停车场">
      {{ zoneInfo.lotName }}
    </el-descriptions-item>
    <el-descriptions-item label="所属停车区">
      {{ zoneInfo.zoneName }}
    </el-descriptions-item>
    <el-descriptions-item label="车位编号">
      {{ spot.spotNumber }}
    </el-descriptions-item>
    <el-descriptions-item label="状态">
      <el-tag :type="statusType">{{ statusText }}</el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="尺寸">
      {{ spot.length }}m × {{ spot.width }}m
    </el-descriptions-item>
  </el-descriptions>
</template>

<style scoped>
.margin-top {
  margin-top: 20px;
}
</style> 