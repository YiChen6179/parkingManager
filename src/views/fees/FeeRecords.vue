<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface FeeRecord {
  id: number
  parkingLotName: string
  vehicleNumber: string
  startTime: string
  endTime: string
  duration: string
  amount: number
  status: 'paid' | 'unpaid'
}

const feeRecords = ref<FeeRecord[]>([
  {
    id: 1,
    parkingLotName: '中心广场停车场',
    vehicleNumber: '粤A12345',
    startTime: '2024-03-15 09:30:00',
    endTime: '2024-03-15 11:30:00',
    duration: '2小时',
    amount: 15,
    status: 'paid'
  },
  {
    id: 2,
    parkingLotName: '商业街停车场',
    vehicleNumber: '粤B67890',
    startTime: '2024-03-15 10:00:00',
    endTime: '',
    duration: '进行中',
    amount: 0,
    status: 'unpaid'
  }
])

const handlePayment = (row: FeeRecord) => {
  ElMessageBox.confirm(`确认收取车辆 ${row.vehicleNumber} 的停车费 ¥${row.amount}？`, '确认收费', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      row.status = 'paid'
      ElMessage.success('收费成功')
    })
    .catch(() => {})
}
</script>

<template>
  <div class="fee-records">
    <div class="header">
      <h2>收费记录</h2>
    </div>

    <el-table :data="feeRecords" style="width: 100%" border>
      <el-table-column prop="parkingLotName" label="停车场" />
      <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
      <el-table-column prop="startTime" label="入场时间" width="180" />
      <el-table-column prop="endTime" label="出场时间" width="180">
        <template #default="{ row }">
          {{ row.endTime || '进行中' }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="停车时长" width="100" />
      <el-table-column prop="amount" label="费用" width="100">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
            {{ row.status === 'paid' ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'unpaid'"
            type="primary"
            size="small"
            @click="handlePayment(row)"
          >
            收费
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.fee-records {
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

/* 让表格填充剩余空间 */
.el-table {
  flex: 1;
  height: calc(100% - 60px); /* 减去header的高度和margin */
  overflow: auto;
}
</style>