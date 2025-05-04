<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ParkingZoneVO, addParkingZone, updateParkingZone, getParkingZoneList, deleteParkingZone } from '@/api/parkingZone'
import { getParkingLotList } from '@/api/parkingLot'

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  zoneName: '',
  parkingLotId: undefined as number | undefined
})

// 停车区列表数据
const parkingZoneList = ref<ParkingZoneVO[]>([])
const total = ref(0)
const loading = ref(false)

// 停车场列表
const parkingLotOptions = ref<{ label: string; value: number }[]>([])
const loadingParkingLots = ref(false)

// 表单相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<ParkingZoneVO>({
  parkingLotId: 0,
  zoneName: '',
  floor: ''
})

const formRules = reactive<FormRules>({
  parkingLotId: [{ required: true, message: '请选择所属停车场', trigger: 'change' }],
  zoneName: [{ required: true, message: '请输入停车区名称', trigger: 'blur' }]
})

// 获取停车区列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getParkingZoneList(queryParams)
    parkingZoneList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取停车区列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取停车场列表
const getParkingLots = async () => {
  loadingParkingLots.value = true
  try {
    const res = await getParkingLotList({ current: 1, size: 100 })
    parkingLotOptions.value = (res.data.records || []).map((item: any) => ({
      label: item.lotName,
      value: item.id as number
    }))
  } catch (error) {
    console.error('获取停车场列表失败:', error)
  } finally {
    loadingParkingLots.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  queryParams.zoneName = ''
  queryParams.parkingLotId = undefined
  handleSearch()
}

// 打开新增对话框
const handleAdd = () => {
  formData.value = {
    parkingLotId: 0,
    zoneName: '',
    floor: ''
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: ParkingZoneVO) => {
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
        await updateParkingZone(formData.value)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addParkingZone(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
}

// 删除停车区
const handleDelete = (row: ParkingZoneVO) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确认删除该停车区吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteParkingZone(row.id as number)
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

// 获取停车场名称
const getParkingLotName = (parkingLotId: number) => {
  const parkingLot = parkingLotOptions.value.find(item => item.value === parkingLotId)
  return parkingLot ? parkingLot.label : '-'
}

onMounted(() => {
  getParkingLots()
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
            v-model="queryParams.parkingLotId"
            placeholder="请选择停车场"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="item in parkingLotOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车区名称">
          <el-input
            v-model="queryParams.zoneName"
            placeholder="请输入停车区名称"
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
        <span class="title">停车区列表</span>
        <el-button type="primary" @click="handleAdd">新增停车区</el-button>
      </div>
      
      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="parkingZoneList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="所属停车场" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getParkingLotName(row.parkingLotId) }}
          </template>
        </el-table-column>
        <el-table-column prop="zoneName" label="停车区名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="floor" label="所在楼层" width="120" align="center" />
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
      :title="formData.id ? '编辑停车区' : '新增停车区'"
      width="500px"
      @closed="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="所属停车场" prop="parkingLotId">
          <el-select
            v-model="formData.parkingLotId"
            placeholder="请选择停车场"
            style="width: 100%"
          >
            <el-option
              v-for="item in parkingLotOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车区名称" prop="zoneName">
          <el-input v-model="formData.zoneName" placeholder="请输入停车区名称" />
        </el-form-item>
        <el-form-item label="所在楼层" prop="floor">
          <el-input v-model="formData.floor" placeholder="请输入所在楼层，如：B1、1F" />
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