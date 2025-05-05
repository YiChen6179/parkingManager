<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface ParkingSpace {
  id: number
  number: string
  parkingLotId: number
  parkingLotName: string
  status: 'available' | 'occupied' | 'maintenance'
  currentVehicle?: string
  startTime?: string
}

const parkingSpaces = ref<ParkingSpace[]>([
  {
    id: 1,
    number: 'A-001',
    parkingLotId: 1,
    parkingLotName: '中心广场停车场',
    status: 'available'
  },
  {
    id: 2,
    number: 'A-002',
    parkingLotId: 1,
    parkingLotName: '中心广场停车场',
    status: 'occupied',
    currentVehicle: '粤A12345',
    startTime: '2024-03-15 09:30:00'
  }
])

const dialogVisible = ref(false)
const formData = ref<ParkingSpace>({
  id: 0,
  number: '',
  parkingLotId: 1,
  parkingLotName: '',
  status: 'available'
})

const parkingLots = ref([
  { id: 1, name: '中心广场停车场' },
  { id: 2, name: '商业街停车场' }
])

const handleEdit = (row: ParkingSpace) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: ParkingSpace) => {
  ElMessageBox.confirm('确认删除该车位？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = parkingSpaces.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        parkingSpaces.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const handleSubmit = () => {
  if (formData.value.id === 0) {
    formData.value.id = parkingSpaces.value.length + 1
    const selectedLot = parkingLots.value.find(lot => lot.id === formData.value.parkingLotId)
    if (selectedLot) {
      formData.value.parkingLotName = selectedLot.name
    }
    parkingSpaces.value.push({ ...formData.value })
  } else {
    const index = parkingSpaces.value.findIndex(item => item.id === formData.value.id)
    if (index > -1) {
      const selectedLot = parkingLots.value.find(lot => lot.id === formData.value.parkingLotId)
      if (selectedLot) {
        formData.value.parkingLotName = selectedLot.name
      }
      parkingSpaces.value[index] = { ...formData.value }
    }
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const resetForm = () => {
  formData.value = {
    id: 0,
    number: '',
    parkingLotId: 1,
    parkingLotName: '',
    status: 'available'
  }
}

const getStatusTag = (status: string) => {
  const statusMap = {
    available: { type: 'success', label: '空闲' },
    occupied: { type: 'danger', label: '已占用' },
    maintenance: { type: 'warning', label: '维护中' }
  }
  return statusMap[status as keyof typeof statusMap] || { type: '', label: status }
}
</script>

<template>
  <div class="parking-spaces">
    <div class="header">
      <h2>车位管理</h2>
      <el-button type="primary" @click="dialogVisible = true; resetForm()">
        新增车位
      </el-button>
    </div>

    <el-table :data="parkingSpaces" style="width: 100%" border>
      <el-table-column prop="number" label="车位编号" width="120" />
      <el-table-column prop="parkingLotName" label="所属停车场" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status).type">
            {{ getStatusTag(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="currentVehicle" label="当前车辆" width="120">
        <template #default="{ row }">
          {{ row.currentVehicle || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180">
        <template #default="{ row }">
          {{ row.startTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === 0 ? '新增车位' : '编辑车位'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="车位编号">
          <el-input v-model="formData.number" />
        </el-form-item>
        <el-form-item label="所属停车场">
          <el-select v-model="formData.parkingLotId">
            <el-option
              v-for="lot in parkingLots"
              :key="lot.id"
              :label="lot.name"
              :value="lot.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status">
            <el-option label="空闲" value="available" />
            <el-option label="已占用" value="occupied" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.status === 'occupied'" label="当前车辆">
          <el-input v-model="formData.currentVehicle" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 0;
}

.parking-spaces {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  height: calc(100vh - 120px); /* 调整高度以填满屏幕，减去头部和边距的空间 */
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

/* 让表格填充剩余空间 */
.el-table {
  flex: 1;
  height: calc(100% - 60px); /* 减去header的高度和margin */
  overflow: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>