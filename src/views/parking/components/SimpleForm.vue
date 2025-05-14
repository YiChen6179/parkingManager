<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ParkingSpotVO, addParkingSpot, updateParkingSpot } from '@/api/parkingSpot'

const props = defineProps<{
  visible: boolean,
  formData: ParkingSpotVO,
  parkingZoneOptions: { label: string, value: number, lotId: number }[],
  parkingLotOptions: { label: string, value: number }[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

// 表单相关
const formRef = ref<FormInstance>()
const formModel = ref<ParkingSpotVO>({ ...props.formData })

// 提交表单
const submitForm = async () => {
  emit('success')
  closeDialog()
}

const closeDialog = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="停车位表单"
    width="500px"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
  >
    <div>这是一个简化的停车位表单</div>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template> 