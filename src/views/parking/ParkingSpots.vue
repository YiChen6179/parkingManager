<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ParkingSpotVO, getParkingSpotList, deleteParkingSpot } from '@/api/parkingSpot'
import { getParkingZoneList } from '@/api/parkingZone'
import { getParkingLotList } from '@/api/parkingLot'
import ParkingSpotForm from './components/ParkingSpotForm.vue'
import ParkingSpotList from './components/ParkingSpotList.vue'
import ParkingSpotSearch from './components/ParkingSpotSearch.vue'

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  spotNumber: '',
  status: undefined as number | undefined,
  zoneId: undefined as number | undefined
})

// 停车位列表数据
const parkingSpotList = ref<ParkingSpotVO[]>([])
const total = ref(0)
const loading = ref(false)

// 停车场和停车区数据
const parkingLotOptions = ref<{ label: string; value: number }[]>([])
const parkingZoneOptions = ref<{ label: string; value: number; lotId: number }[]>([])
const selectedLotId = ref<number | undefined>(undefined)

// 表单相关
const dialogVisible = ref(false)
const formData = ref<ParkingSpotVO>({
  parkingZoneId: undefined as unknown as number,
  status: 0,
  spotNumber: '',
  length: undefined,
  width: undefined
})

// 当前选择的停车区前缀
const selectedZonePrefix = ref('')
const userInputSpotNumber = ref('')

// 获取停车位列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getParkingSpotList(queryParams)
    parkingSpotList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取停车位列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取停车场列表
const getParkingLots = async () => {
  try {
    const res = await getParkingLotList({ current: 1, size: 100 })
    parkingLotOptions.value = (res.data.records || []).map((item: any) => ({
      label: item.lotName,
      value: item.id as number
    }))
  } catch (error) {
    console.error('获取停车场列表失败:', error)
  }
}

// 获取停车区列表
const getParkingZones = async (lotId?: number) => {
  try {
    const params = lotId ? { parkingLotId: lotId, current: 1, size: 100 } : { current: 1, size: 100 }
    const res = await getParkingZoneList(params)
    parkingZoneOptions.value = (res.data.records || []).map((item: any) => ({
      label: item.zoneName,
      value: item.id as number,
      lotId: item.parkingLotId
    }))
  } catch (error) {
    console.error('获取停车区列表失败:', error)
  }
}

// 停车场选择变化
const handleLotChange = (value: number) => {
  selectedLotId.value = value
  queryParams.zoneId = undefined
}

// 停车区选择变化处理
const handleParkingZoneChange = (value: number) => {
  if (value) {
    const zone = parkingZoneOptions.value.find(item => item.value === value)
    if (zone) {
      // 从停车区名称中提取前缀（假设格式如"A区"，取第一个字符作为前缀）
      const prefix = zone.label.charAt(0)
      selectedZonePrefix.value = prefix
      
      // 如果用户已输入编号，则更新完整车位编号
      if (userInputSpotNumber.value) {
        queryParams.spotNumber = `${prefix}-${userInputSpotNumber.value}`
      } else {
        queryParams.spotNumber = ''
      }
    }
  } else {
    selectedZonePrefix.value = ''
    queryParams.spotNumber = userInputSpotNumber.value
  }
}

// 处理车位编号输入，自动添加前缀
const handleSpotNumberInput = (value: string) => {
  // 保存用户输入的原始值
  userInputSpotNumber.value = value
  
  // 如果有选择停车区，且有前缀，则添加前缀
  if (selectedZonePrefix.value) {
    // 如果用户输入的值已经包含前缀，则不重复添加
    if (value.startsWith(`${selectedZonePrefix.value}-`)) {
      queryParams.spotNumber = value
    } else {
      // 检查用户输入是否已经包含"-"
      const parts = value.split('-')
      if (parts.length > 1 && parts[0] === selectedZonePrefix.value) {
        // 已经是正确格式，不做处理
        queryParams.spotNumber = value
      } else {
        // 移除可能存在的前缀
        let cleanNumber = value
        if (value.includes('-')) {
          cleanNumber = value.split('-').pop() || value
        }
        queryParams.spotNumber = `${selectedZonePrefix.value}-${cleanNumber}`
      }
    }
  } else {
    // 没有选择停车区，保持原值
    queryParams.spotNumber = value
  }
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  queryParams.spotNumber = ''
  userInputSpotNumber.value = ''
  queryParams.status = undefined
  queryParams.zoneId = undefined
  selectedLotId.value = undefined
  selectedZonePrefix.value = ''
  handleSearch()
}

// 打开新增对话框
const handleAdd = () => {
  formData.value = {
    parkingZoneId: undefined as unknown as number,
    status: 0,
    spotNumber: '',
    length: 5.5,
    width: 2.5
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: ParkingSpotVO) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

// 表单提交成功回调
const handleFormSuccess = () => {
  getList()
}

// 删除停车位
const handleDelete = (row: ParkingSpotVO) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确认删除该停车位吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteParkingSpot(row.id as number)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败:', error)
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

onMounted(() => {
  getParkingLots()
  getParkingZones()
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <ParkingSpotSearch
      :query-params="queryParams"
      :parking-lot-options="parkingLotOptions"
      :parking-zone-options="parkingZoneOptions"
      @search="handleSearch"
      @reset="resetQuery"
      @lot-change="handleLotChange"
      @zone-change="handleParkingZoneChange"
      @spot-number-input="handleSpotNumberInput"
    />

    <!-- 停车位列表 -->
    <ParkingSpotList
      :loading="loading"
      :parking-spot-list="parkingSpotList"
      :total="total"
      :current-page="queryParams.current"
      :page-size="queryParams.size"
      :parking-zone-options="parkingZoneOptions"
      :parking-lot-options="parkingLotOptions"
      @edit="handleEdit"
      @delete="handleDelete"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #action>
        <el-button type="primary" @click="handleAdd">新增停车位</el-button>
      </template>
    </ParkingSpotList>

    <!-- 表单对话框 -->
    <ParkingSpotForm 
      v-model:visible="dialogVisible"
      :form-data="formData"
      :parking-zone-options="parkingZoneOptions"
      :parking-lot-options="parkingLotOptions"
      @success="handleFormSuccess"
    />

    <!-- 测试简单对话框 -->
    <!-- <SimpleDialog v-model:visible="dialogVisible" /> -->
  </div>
</template>

<style scoped>
.app-container {
  padding: 0;
}
</style> 