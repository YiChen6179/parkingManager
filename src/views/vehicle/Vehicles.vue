<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { VehicleVO, addVehicle, updateVehicle, getVehicleList, deleteVehicle } from '@/api/vehicle'
import { getUserList } from '@/api/user'

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  plateNumber: '',
  userId: undefined as number | undefined
})

// 车辆列表数据
const vehicleList = ref<VehicleVO[]>([])
const total = ref(0)
const loading = ref(false)

// 用户列表数据
const userOptions = ref<{ label: string; value: number }[]>([])

// 表单相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<VehicleVO>({
  userId: 0,
  plateNumber: '',
  vehicleType: '',
  vehicleColor: ''
})

const formRules = reactive<FormRules>({
  userId: [{ required: true, message: '请选择所有者', trigger: 'change' }],
  plateNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }]
})

// 获取车辆列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getVehicleList(queryParams)
    vehicleList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取用户列表
const getUsers = async () => {
  try {
    const res = await getUserList({ current: 1, size: 100 })
    userOptions.value = (res.data.records || []).map((item: any) => ({
      label: item.username,
      value: item.id as number
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取用户名称
const getUserName = (userId: number) => {
  const user = userOptions.value.find(item => item.value === userId)
  return user ? user.label : '-'
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  queryParams.plateNumber = ''
  queryParams.userId = undefined
  handleSearch()
}

// 打开新增对话框
const handleAdd = () => {
  formData.value = {
    userId: 0,
    plateNumber: '',
    vehicleType: '',
    vehicleColor: ''
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: VehicleVO) => {
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
        await updateVehicle(formData.value)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addVehicle(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
}

// 删除车辆
const handleDelete = (row: VehicleVO) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确认删除该车辆吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteVehicle(row.id as number)
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
  getUsers()
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="车牌号">
          <el-input
            v-model="queryParams.plateNumber"
            placeholder="请输入车牌号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="所有者">
          <el-select
            v-model="queryParams.userId"
            placeholder="请选择所有者"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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
        <span class="title">车辆列表</span>
        <el-button type="primary" @click="handleAdd">新增车辆</el-button>
      </div>
      
      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="vehicleList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" align="center" />
        <el-table-column label="所有者" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getUserName(row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="vehicleType" label="类型" width="100" align="center" />
        <el-table-column prop="vehicleColor" label="颜色" width="100" align="center" />
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
      :title="formData.id ? '编辑车辆' : '新增车辆'"
      width="500px"
      @closed="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="所有者" prop="userId">
          <el-select
            v-model="formData.userId"
            placeholder="请选择所有者"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="formData.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="vehicleType">
          <el-input v-model="formData.vehicleType" placeholder="请输入车辆类型，如：轿车、SUV等" />
        </el-form-item>
        <el-form-item label="车辆颜色" prop="vehicleColor">
          <el-input v-model="formData.vehicleColor" placeholder="请输入车辆颜色" />
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