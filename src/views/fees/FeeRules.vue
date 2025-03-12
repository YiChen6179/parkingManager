<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface FeeRule {
  id: number
  parkingLotId: number
  parkingLotName: string
  firstHourFee: number
  additionalHourFee: number
  dailyMaxFee: number
  status: 'active' | 'inactive'
}

const feeRules = ref<FeeRule[]>([
  {
    id: 1,
    parkingLotId: 1,
    parkingLotName: '中心广场停车场',
    firstHourFee: 10,
    additionalHourFee: 5,
    dailyMaxFee: 50,
    status: 'active'
  },
  {
    id: 2,
    parkingLotId: 2,
    parkingLotName: '商业街停车场',
    firstHourFee: 8,
    additionalHourFee: 4,
    dailyMaxFee: 40,
    status: 'active'
  }
])

const ruleDialogVisible = ref(false)
const ruleFormData = ref<FeeRule>({
  id: 0,
  parkingLotId: 1,
  parkingLotName: '',
  firstHourFee: 0,
  additionalHourFee: 0,
  dailyMaxFee: 0,
  status: 'active'
})

const parkingLots = ref([
  { id: 1, name: '中心广场停车场' },
  { id: 2, name: '商业街停车场' }
])

const handleEditRule = (row: FeeRule) => {
  ruleFormData.value = { ...row }
  ruleDialogVisible.value = true
}

const handleDeleteRule = (row: FeeRule) => {
  ElMessageBox.confirm('确认删除该计费规则？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = feeRules.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        feeRules.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const handleSubmitRule = () => {
  if (ruleFormData.value.id === 0) {
    ruleFormData.value.id = feeRules.value.length + 1
    const selectedLot = parkingLots.value.find(
      lot => lot.id === ruleFormData.value.parkingLotId
    )
    if (selectedLot) {
      ruleFormData.value.parkingLotName = selectedLot.name
    }
    feeRules.value.push({ ...ruleFormData.value })
  } else {
    const index = feeRules.value.findIndex(item => item.id === ruleFormData.value.id)
    if (index > -1) {
      const selectedLot = parkingLots.value.find(
        lot => lot.id === ruleFormData.value.parkingLotId
      )
      if (selectedLot) {
        ruleFormData.value.parkingLotName = selectedLot.name
      }
      feeRules.value[index] = { ...ruleFormData.value }
    }
  }
  ruleDialogVisible.value = false
  ElMessage.success('保存成功')
}

const resetRuleForm = () => {
  ruleFormData.value = {
    id: 0,
    parkingLotId: 1,
    parkingLotName: '',
    firstHourFee: 0,
    additionalHourFee: 0,
    dailyMaxFee: 0,
    status: 'active'
  }
}
</script>

<template>
  <div class="fee-rules">
    <div class="header">
      <h2>计费规则管理</h2>
    </div>

    <div class="tab-header">
      <el-button type="primary" @click="ruleDialogVisible = true; resetRuleForm()">
        新增规则
      </el-button>
    </div>

    <el-table :data="feeRules" style="width: 100%" border>
      <el-table-column prop="parkingLotName" label="停车场" />
      <el-table-column prop="firstHourFee" label="首小时收费(元)" width="140">
        <template #default="{ row }">
          ¥{{ row.firstHourFee }}
        </template>
      </el-table-column>
      <el-table-column prop="additionalHourFee" label="后续每小时(元)" width="140">
        <template #default="{ row }">
          ¥{{ row.additionalHourFee }}
        </template>
      </el-table-column>
      <el-table-column prop="dailyMaxFee" label="每日上限(元)" width="120">
        <template #default="{ row }">
          ¥{{ row.dailyMaxFee }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEditRule(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteRule(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleFormData.id === 0 ? '新增计费规则' : '编辑计费规则'"
      width="500px"
    >
      <el-form :model="ruleFormData" label-width="120px">
        <el-form-item label="停车场">
          <el-select v-model="ruleFormData.parkingLotId">
            <el-option
              v-for="lot in parkingLots"
              :key="lot.id"
              :label="lot.name"
              :value="lot.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="首小时收费(元)">
          <el-input-number v-model="ruleFormData.firstHourFee" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="后续每小时(元)">
          <el-input-number
            v-model="ruleFormData.additionalHourFee"
            :min="0"
            :precision="2"
          />
        </el-form-item>
        <el-form-item label="每日上限(元)">
          <el-input-number v-model="ruleFormData.dailyMaxFee" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="ruleFormData.status">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRule">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.fee-rules {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  height: calc(100vh - 120px); /* 调整高度以填满屏幕，减去头部和边距的空间 */
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.tab-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 让表格填充剩余空间 */
.el-table {
  flex: 1;
  height: calc(100% - 100px); /* 减去header和tab-header的高度和margin */
  overflow: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>