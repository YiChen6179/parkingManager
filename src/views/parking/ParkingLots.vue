<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ParkingLotVO, addParkingLot, updateParkingLot, getParkingLotList, deleteParkingLot } from '@/api/parkingLot'

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  name: ''
})

// 停车场列表数据
const parkingLotList = ref<ParkingLotVO[]>([])
const total = ref(0)
const loading = ref(false)

// 表单相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<ParkingLotVO>({
  lotName: '',
  address: ''
})

const formRules = reactive<FormRules>({
  lotName: [{ required: true, message: '请输入停车场名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入停车场地址', trigger: 'blur' }]
})

// 获取停车场列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getParkingLotList(queryParams)
    parkingLotList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取停车场列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  queryParams.name = ''
  handleSearch()
}

// 打开新增对话框
const handleAdd = () => {
  formData.value = {
    lotName: '',
    address: ''
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: ParkingLotVO) => {
  formData.value = { 
    id: row.id,
    lotName: row.lotName,
    address: row.address
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
        await updateParkingLot(formData.value)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addParkingLot(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
}

// 删除停车场
const handleDelete = (row: ParkingLotVO) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确认删除该停车场吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteParkingLot(row.id as number)
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
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="停车场名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入停车场名称"
            clearable
            @keyup.enter="handleSearch"
          />
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
        <span class="title">停车场列表</span>
        <el-button type="primary" @click="handleAdd">新增停车场</el-button>
    </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="parkingLotList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="lotName" label="停车场名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="totalSpot" label="总车位数" width="120" align="center" />
        <el-table-column prop="usedSpot" label="当前使用数" width="120" align="center" />
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
      :title="formData.id ? '编辑停车场' : '新增停车场'"
      width="500px"
      @closed="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="停车场名称" prop="lotName">
          <el-input v-model="formData.lotName" placeholder="请输入停车场名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入停车场地址" />
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
</style>