<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ParkingSpotVO, addParkingSpot, updateParkingSpot, getParkingSpotList, deleteParkingSpot } from '@/api/parkingSpot'
import { getParkingZoneList } from '@/api/parkingZone'
import { getParkingLotList } from '@/api/parkingLot'

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
const formRef = ref<FormInstance>()
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

const formRules = reactive<FormRules>({
  parkingZoneId: [{ required: true, message: '请选择所属停车区', trigger: 'change' }],
  spotNumber: [{ required: true, message: '请输入车位编号', trigger: 'blur' }]
})

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

// 获取指定停车场的停车区
const getZonesByLotId = (lotId: number) => {
  return parkingZoneOptions.value.filter(item => item.lotId === lotId)
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
        formData.value.spotNumber = `${prefix}-${userInputSpotNumber.value}`
      } else {
        formData.value.spotNumber = ''
      }
    }
  } else {
    selectedZonePrefix.value = ''
    formData.value.spotNumber = userInputSpotNumber.value
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
      formData.value.spotNumber = value
    } else {
      // 检查用户输入是否已经包含"-"
      const parts = value.split('-')
      if (parts.length > 1 && parts[0] === selectedZonePrefix.value) {
        // 已经是正确格式，不做处理
        formData.value.spotNumber = value
      } else {
        // 移除可能存在的前缀
        let cleanNumber = value
        if (value.includes('-')) {
          cleanNumber = value.split('-').pop() || value
        }
        formData.value.spotNumber = `${selectedZonePrefix.value}-${cleanNumber}`
      }
    }
  } else {
    // 没有选择停车区，保持原值
    formData.value.spotNumber = value
  }
}

// 搜索
const handleSearch = () => {
  // 如果是使用前缀输入的，需要更新查询参数
  if (selectedZonePrefix.value && userInputSpotNumber.value) {
    queryParams.spotNumber = `${selectedZonePrefix.value}-${userInputSpotNumber.value}`
  } else {
    queryParams.spotNumber = userInputSpotNumber.value
  }
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
  userInputSpotNumber.value = ''
  selectedZonePrefix.value = ''
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: ParkingSpotVO) => {
  formData.value = { ...row }
  
  // 解析现有车位编号，提取前缀和用户输入部分
  if (row.spotNumber && row.spotNumber.includes('-')) {
    const parts = row.spotNumber.split('-')
    selectedZonePrefix.value = parts[0]
    userInputSpotNumber.value = parts.slice(1).join('-')
  } else {
    selectedZonePrefix.value = ''
    userInputSpotNumber.value = row.spotNumber
  }
  
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
        await updateParkingSpot(formData.value)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addParkingSpot(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
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

// 获取停车区名称
const getZoneName = (zoneId: number) => {
  const zone = parkingZoneOptions.value.find(item => item.value === zoneId)
  return zone ? zone.label : '-'
}

// 获取车位状态
const getStatusText = (status: number) => {
  return status === 0 ? '空闲' : '占用'
}

// 获取车位状态类型
const getStatusType = (status: number) => {
  return status === 0 ? 'success' : 'danger'
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
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="所属停车场">
          <el-select
            v-model="selectedLotId"
            placeholder="请选择停车场"
            clearable
            style="width: 180px"
            @change="handleLotChange"
          >
            <el-option
              v-for="item in parkingLotOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属停车区">
          <el-select
            v-model="queryParams.zoneId"
            placeholder="请选择停车区"
            clearable
            style="width: 180px"
            @change="handleParkingZoneChange"
          >
            <el-option
              v-for="item in selectedLotId ? getZonesByLotId(selectedLotId) : parkingZoneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号">
          <div class="spot-number-input">
            <span v-if="selectedZonePrefix" class="prefix">{{ selectedZonePrefix }}-</span>
            <el-input
              v-model="userInputSpotNumber"
              :placeholder="selectedZonePrefix ? '请输入车位号码' : '请输入车位编号'"
              clearable
              @keyup.enter="handleSearch"
              @input="handleSpotNumberInput"
            />
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="空闲" :value="0" />
            <el-option label="占用" :value="1" />
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
        <span class="title">停车位列表</span>
        <el-button type="primary" @click="handleAdd">新增停车位</el-button>
      </div>
      
      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="parkingSpotList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="所属停车区" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getZoneName(row.parkingZoneId) }}
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
      :title="formData.id ? '编辑停车位' : '新增停车位'"
      width="500px"
      @closed="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="所属停车区" prop="parkingZoneId">
          <el-select
            v-model="formData.parkingZoneId"
            placeholder="请选择停车区"
            style="width: 100%"
            @change="handleParkingZoneChange"
          >
            <el-option
              v-for="item in parkingZoneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号" prop="spotNumber">
          <div class="spot-number-input">
            <span v-if="selectedZonePrefix" class="prefix">{{ selectedZonePrefix }}-</span>
            <el-input 
              v-model="userInputSpotNumber" 
              :placeholder="selectedZonePrefix ? '请输入车位号码' : '请输入车位编号'"
              @input="handleSpotNumberInput"
            />
          </div>
        </el-form-item>
        <el-form-item label="车位状态" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="空闲" :value="0" />
            <el-option label="占用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="长度(m)" prop="length">
          <el-input-number v-model="formData.length" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="宽度(m)" prop="width">
          <el-input-number v-model="formData.width" :min="0" :precision="1" style="width: 100%" />
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

.spot-number-input {
  display: flex;
  align-items: center;
}

.prefix {
  margin-right: 5px;
  padding: 0 5px;
  height: 32px;
  line-height: 32px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px 0 0 4px;
  color: #606266;
}

.spot-number-input .el-input {
  flex: 1;
}

.spot-number-input .el-input input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style> 