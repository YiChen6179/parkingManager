<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface ParkingLot {
  id: number
  name: string
  address: string
  totalSpaces: number
  availableSpaces: number
  status: 'active' | 'inactive'
}

const parkingLots = ref<ParkingLot[]>([
  {
    id: 1,
    name: '中心广场停车场',
    address: '市中心广场地下一层',
    totalSpaces: 200,
    availableSpaces: 150,
    status: 'active'
  },
  {
    id: 2,
    name: '商业街停车场',
    address: '东部商业街1号',
    totalSpaces: 150,
    availableSpaces: 80,
    status: 'active'
  }
])

const dialogVisible = ref(false)
const formData = ref<ParkingLot>({
  id: 0,
  name: '',
  address: '',
  totalSpaces: 0,
  availableSpaces: 0,
  status: 'active'
})

const handleEdit = (row: ParkingLot) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: ParkingLot) => {
  ElMessageBox.confirm('确认删除该停车场？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = parkingLots.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        parkingLots.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const handleSubmit = () => {
  if (formData.value.id === 0) {
    // 新增
    formData.value.id = parkingLots.value.length + 1
    parkingLots.value.push({ ...formData.value })
  } else {
    // 编辑
    const index = parkingLots.value.findIndex(item => item.id === formData.value.id)
    if (index > -1) {
      parkingLots.value[index] = { ...formData.value }
    }
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const resetForm = () => {
  formData.value = {
    id: 0,
    name: '',
    address: '',
    totalSpaces: 0,
    availableSpaces: 0,
    status: 'active'
  }
}
</script>

<template>
  <div class="parking-lots">
    <div class="header">
      <h2>停车场管理</h2>
      <el-button type="primary" @click="dialogVisible = true; resetForm()">
        新增停车场
      </el-button>
    </div>

    <el-table :data="parkingLots" style="width: 100%" border>
      <el-table-column prop="name" label="停车场名称" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="totalSpaces" label="总车位数" width="120" />
      <el-table-column prop="availableSpaces" label="可用车位数" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '正常' : '停用' }}
          </el-tag>
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
      :title="formData.id === 0 ? '新增停车场' : '编辑停车场'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="停车场名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" />
        </el-form-item>
        <el-form-item label="总车位数">
          <el-input-number v-model="formData.totalSpaces" :min="0" />
        </el-form-item>
        <el-form-item label="可用车位数">
          <el-input-number
            v-model="formData.availableSpaces"
            :min="0"
            :max="formData.totalSpaces"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status">
            <el-option label="正常" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
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
.parking-lots {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>