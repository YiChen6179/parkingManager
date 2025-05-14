<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ParkingRecordVO, addParkingRecord, updateParkingRecord, getParkingRecordList, deleteParkingRecord, vehicleExit } from '@/api/parkingRecord'
import { getParkingSpotList } from '@/api/parkingSpot'
import { getVehicleList } from '@/api/vehicle'
import ParkingRecordForm from './components/ParkingRecordForm.vue'

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  status: undefined as number | undefined,
  vehicleId: undefined as number | undefined
})

// 停车记录列表数据
const parkingRecordList = ref<ParkingRecordVO[]>([])
const total = ref(0)
const loading = ref(false)

// 停车位和车辆列表
const parkingSpotOptions = ref<{ label: string; value: number }[]>([])
const vehicleOptions = ref<{ label: string; value: number }[]>([])

// 表单相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<ParkingRecordVO>({
  parkingSpotId: undefined as unknown as number,
  vehicleId: undefined as unknown as number,
  status: 0, // 默认为进行中
  plateNumber: '',
  entryTime: new Date().toISOString()
})

const formRules = reactive<FormRules>({
  parkingSpotId: [{ required: true, message: '请选择停车位', trigger: 'change' }],
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }]
})

// 获取停车记录列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getParkingRecordList(queryParams)
    parkingRecordList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取停车记录列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取停车位列表
const getParkingSpots = async () => {
  try {
    const res = await getParkingSpotList({ current: 1, size: 100 })
    parkingSpotOptions.value = (res.data.records || []).map((item: any) => ({
      label: item.spotNumber,
      value: item.id as number
    }))
    console.log('已加载停车位选项:', parkingSpotOptions.value)
  } catch (error) {
    console.error('获取停车位列表失败:', error)
  }
}

// 获取车辆列表
const getVehicles = async () => {
  try {
    const res = await getVehicleList({ current: 1, size: 100 })
    vehicleOptions.value = (res.data.records || []).map((item: any) => ({
      label: `${item.plateNumber}`,
      value: item.id as number
    }))
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  queryParams.status = undefined
  queryParams.vehicleId = undefined
  handleSearch()
}

// 打开新增对话框
const handleAdd = () => {
  formData.value = {
    parkingSpotId: undefined as unknown as number,
    vehicleId: undefined as unknown as number,
    status: 0, // 默认为进行中
    plateNumber: '',
    entryTime: new Date().toISOString()
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: ParkingRecordVO) => {
  formData.value = { ...row }
  // 如果没有车牌号但有车辆ID，尝试从选项中获取车牌号
  if (!formData.value.plateNumber && formData.value.vehicleId) {
    const vehicle = vehicleOptions.value.find(item => item.value === formData.value.vehicleId)
    if (vehicle) {
      formData.value.plateNumber = vehicle.label || ''
    }
  }
  dialogVisible.value = true
}

// 表单提交成功回调
const handleFormSuccess = () => {
  getList()
}

// 删除停车记录
const handleDelete = (row: ParkingRecordVO) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确认删除该停车记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteParkingRecord(row.id as number)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 车辆出场
const handleVehicleExit = (row: ParkingRecordVO) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确认此车辆已出场？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用车辆出场API
      await vehicleExit(row.id as number)
      ElMessage.success('车辆出场成功')
      getList()
    } catch (error) {
      console.error('车辆出场失败:', error)
      // 如果后端API调用失败，也可以尝试通过前端更新状态
      try {
        // 创建更新对象
        const updateData: ParkingRecordVO = {
          id: row.id,
          parkingSpotId: row.parkingSpotId,
          vehicleId: row.vehicleId,
          status: 1, // 设置为已完成
          exitTime: new Date().toISOString() // 设置出场时间为当前时间
        }
        
        // 计算停车时长
        if (row.entryTime) {
          const entryTime = new Date(row.entryTime).getTime()
          const exitTime = new Date().getTime()
          const diffMinutes = Math.floor((exitTime - entryTime) / (1000 * 60))
          updateData.parkingTime = diffMinutes > 0 ? diffMinutes : 0
        }
        
        // 调用更新API
        await updateParkingRecord(updateData)
        ElMessage.success('车辆出场成功（通过更新记录）')
        getList()
      } catch (updateError) {
        console.error('通过更新记录设置车辆出场失败:', updateError)
        ElMessage.error('车辆出场失败，请重试或手动编辑记录')
      }
    }
  }).catch(() => {})
}

// 分页变化
const handleCurrentChange = (page: number) => {
  queryParams.current = page
  getList()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.current = 1
  getList()
}

// 获取停车位名称
const getSpotNumber = (spotId: number) => {
  const spot = parkingSpotOptions.value.find(item => item.value === spotId)
  return spot ? spot.label : '-'
}

// 获取车牌号
const getPlateNumber = (vehicleId: number) => {
  const vehicle = vehicleOptions.value.find(item => item.value === vehicleId)
  return vehicle ? vehicle.label : '-'
}

// 获取状态文本
const getStatusText = (status: number) => {
  return status === 1 ? '已完成' : '进行中'
}

// 获取状态类型
const getStatusType = (status: number) => {
  return status === 1 ? 'info' : 'primary'
}

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

// 格式化停车时间
const formatParkingTime = (minutes: number | undefined) => {
  if (!minutes) return '-'
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}小时${remainingMinutes}分钟`
  } else {
    return `${remainingMinutes}分钟`
  }
}

// 车辆选择变化处理
const handleVehicleChange = (value: number) => {
  if (value) {
    const vehicle = vehicleOptions.value.find(item => item.value === value)
    if (vehicle) {
      formData.value.plateNumber = vehicle.label || ''
    }
  } else {
    formData.value.plateNumber = ''
  }
}

onMounted(() => {
  getParkingSpots()
  getVehicles()
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="车辆">
          <el-select
            v-model="queryParams.vehicleId"
            placeholder="请选择车辆"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in vehicleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="进行中" :value="0" />
            <el-option label="已完成" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="action-card">
      <div class="action-header">
        <span class="title">停车记录列表</span>
        <el-button type="primary" @click="handleAdd">新增停车记录</el-button>
      </div>
      
      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="parkingRecordList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="车辆" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.plateNumber || getPlateNumber(row.vehicleId) }}
          </template>
        </el-table-column>
        <el-table-column label="停车位" width="100" align="center">
          <template #default="{ row }">
            {{ getSpotNumber(row.parkingSpotId) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status || 0)">
              {{ getStatusText(row.status || 0) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入场时间" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatTime(row.entryTime) }}
          </template>
        </el-table-column>
        <el-table-column label="出场时间" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatTime(row.exitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="停车时长" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatParkingTime(row.parkingTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              @click="handleVehicleExit(row)"
            >
              出场
            </el-button>
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
        :current-page="queryParams.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 表单对话框 -->
    <ParkingRecordForm
      v-model:visible="dialogVisible"
      :form-data="formData"
      :parking-spot-options="parkingSpotOptions"
      :vehicle-options="vehicleOptions"
      @success="handleFormSuccess"
    />
  </div>
</template>

<style scoped>
.app-container {
  padding: 0;
}

.search-card,
.action-card {
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