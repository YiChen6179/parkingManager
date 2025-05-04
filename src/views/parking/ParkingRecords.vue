<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ParkingRecordVO, addParkingRecord, updateParkingRecord, getParkingRecordList, deleteParkingRecord, vehicleExit } from '@/api/parkingRecord'
import { getParkingSpotList } from '@/api/parkingSpot'
import { getVehicleList } from '@/api/vehicle'

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
  parkingSpotId: 0,
  vehicleId: 0,
  status: 1, // 默认为停车中
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
    parkingSpotId: 0,
    vehicleId: 0,
    status: 1, // 默认为停车中
    plateNumber: '',
    entryTime: new Date().toISOString()
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: ParkingRecordVO) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (formData.value.id) {
        // 编辑
        await updateParkingRecord(formData.value)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addParkingRecord(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
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
      await vehicleExit(row.id as number)
      ElMessage.success('车辆出场成功')
      getList()
    } catch (error) {
      console.error('车辆出场失败:', error)
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
  return status === 0 ? '已完成' : '停车中'
}

// 获取状态类型
const getStatusType = (status: number) => {
  return status === 0 ? 'info' : 'primary'
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
            <el-option label="停车中" :value="1" />
            <el-option label="已完成" :value="0" />
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
            <el-tag :type="getStatusType(row.status || 1)">
              {{ getStatusText(row.status || 1) }}
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
              v-if="row.status === 1"
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
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '编辑停车记录' : '新增停车记录'"
      width="500px"
      @closed="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="停车位" prop="parkingSpotId">
          <el-select
            v-model="formData.parkingSpotId"
            placeholder="请选择停车位"
            style="width: 100%"
          >
            <el-option
              v-for="item in parkingSpotOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车辆" prop="vehicleId">
          <el-select
            v-model="formData.vehicleId"
            placeholder="请选择车辆"
            style="width: 100%"
          >
            <el-option
              v-for="item in vehicleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="formData.plateNumber" placeholder="请输入车牌号，非必填" />
        </el-form-item>
        <el-form-item label="入场时间" prop="entryTime">
          <el-date-picker
            v-model="formData.entryTime"
            type="datetime"
            placeholder="请选择入场时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="formData.id" label="出场时间" prop="exitTime">
          <el-date-picker
            v-model="formData.exitTime"
            type="datetime"
            placeholder="请选择出场时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="停车中" :value="1" />
            <el-option label="已完成" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
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