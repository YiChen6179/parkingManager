<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits, watchEffect, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ParkingRecordVO, addParkingRecord, updateParkingRecord } from '@/api/parkingRecord'
import { getParkingLotList } from '@/api/parkingLot'
import { associateSpotsWithLots, filterSpotsByLot } from '@/utils/parkingUtils'
import { getParkingSpotsByLotName } from '@/api/parkingSpot'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean,
  formData: ParkingRecordVO,
  parkingSpotOptions: { label: string; value: number }[],
  vehicleOptions: { label: string; value: number }[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void,
  (e: 'success'): void
}>()

// 表单相关
const formRef = ref<FormInstance>()
// 创建本地状态对象，用于表单数据处理
const formState = reactive({
  // 表单模型
  model: {
    id: undefined,
    parkingSpotId: undefined as unknown as number,
    vehicleId: undefined as unknown as number,
    status: 0, // 默认为进行中
    plateNumber: '',
    entryTime: new Date().toISOString()
  } as ParkingRecordVO,
  // 选中的停车场ID
  selectedLotId: undefined as number | undefined,
  // 临时存储停车场ID，用于调试功能
  tempLotId: undefined as number | undefined,
  // 表单是否已初始化
  initialized: false,
  // 是否正在加载停车位
  loadingSpots: false
})

// 停车场选项
const parkingLotOptions = ref<{ label: string; value: number }[]>([])

// 扩展停车位选项
const extendedSpotOptions = ref<{ label: string; value: number; lotId?: number; temporary?: boolean }[]>([])

const formRules = reactive<FormRules>({
  parkingSpotId: [{ required: true, message: '请选择停车位', trigger: 'change' }],
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }]
})

// 根据选中的停车场，过滤停车位选项
const filteredSpotOptions = computed(() => {
  // 直接返回扩展后的停车位选项，这些已经是通过API按停车场过滤好的
  return extendedSpotOptions.value
})

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

// 停车场选择变化处理
const handleLotChange = async (value: number) => {
  formState.selectedLotId = value
  // 清空已选的停车位
  formState.model.parkingSpotId = undefined as unknown as number
  
  if (value) {
    // 查找选中的停车场，获取停车场名称
    const selectedLot = parkingLotOptions.value.find(lot => lot.value === value)
    if (!selectedLot) {
      console.error('无法找到选中的停车场')
      return
    }
    
    // 设置加载状态
    formState.loadingSpots = true
    extendedSpotOptions.value = []
    
    // 使用新API获取当前停车场的空闲停车位
    try {
      const lotName = selectedLot.label
      console.log(`正在获取停车场"${lotName}"的空闲停车位`)
      // 传递status=0参数，只获取空闲的停车位
      const res = await getParkingSpotsByLotName(lotName, 0)
      
      if (res.data && Array.isArray(res.data)) {
        // 将后端返回的停车位数据转换为选项格式
        extendedSpotOptions.value = res.data.map((spot: any) => ({
          label: spot.spotNumber,
          value: spot.id,
          lotId: value // 保存当前停车场ID用于关联
        }))
        console.log(`成功获取到${extendedSpotOptions.value.length}个空闲停车位`, extendedSpotOptions.value)
      } else {
        console.warn('API返回的停车位数据格式不正确', res)
        extendedSpotOptions.value = []
      }
    } catch (error) {
      console.error('获取停车场空闲停车位失败:', error)
      ElMessage.error('获取停车位数据失败，请重试')
      extendedSpotOptions.value = []
    } finally {
      // 无论成功还是失败，都结束加载状态
      formState.loadingSpots = false
    }
  } else {
    // 清空停车位选项
    extendedSpotOptions.value = []
  }
}

// 车辆选择变化处理
const handleVehicleChange = (value: number) => {
  if (value) {
    const vehicle = props.vehicleOptions.find(item => item.value === value)
    if (vehicle) {
      formState.model.plateNumber = vehicle.label || ''
    }
  } else {
    formState.model.plateNumber = ''
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // 如果状态变为已完成，且没有设置出场时间，则自动设置为当前时间
      if (formState.model.status === 1 && !formState.model.exitTime) {
        formState.model.exitTime = new Date().toISOString()
      }
      
      // 如果同时有入场和出场时间，计算停车时长
      if (formState.model.entryTime && formState.model.exitTime) {
        const entryTime = new Date(formState.model.entryTime).getTime()
        const exitTime = new Date(formState.model.exitTime).getTime()
        const diffMinutes = Math.floor((exitTime - entryTime) / (1000 * 60))
        formState.model.parkingTime = diffMinutes > 0 ? diffMinutes : 0
      }
      
      if (formState.model.id) {
        // 编辑
        await updateParkingRecord(formState.model)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addParkingRecord(formState.model)
        ElMessage.success('添加成功')
      }
      closeDialog()
      emit('success')
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
}

const closeDialog = () => {
  emit('update:visible', false)
  // 重置表单状态
  resetForm()
}

// 重置表单
const resetForm = () => {
  formState.model = {
    id: undefined,
    parkingSpotId: undefined as unknown as number,
    vehicleId: undefined as unknown as number,
    status: 0,
    plateNumber: '',
    entryTime: new Date().toISOString()
  }
  formState.selectedLotId = undefined
  formState.initialized = false
}

// 初始化表单数据
const initFormData = async () => {
  // 复制表单数据
  Object.assign(formState.model, props.formData)
  
  // 获取停车场列表
  await getParkingLots()
  
  // 如果是编辑状态，找到对应的停车场
  if (formState.model.parkingSpotId) {
    // 在parkingSpotOptions中查找当前停车位
    const spot = props.parkingSpotOptions.find(s => s.value === formState.model.parkingSpotId)
    
    if (spot && spot.label) {
      // 从停车位编号中尝试提取停车场标识，如"A-001"中的"A"
      const prefix = spot.label.split('-')[0] || spot.label.charAt(0)
      
      // 查找匹配的停车场
      const matchedLot = parkingLotOptions.value.find(lot => 
        lot.label.startsWith(prefix) || 
        lot.label.charAt(0) === prefix
      )
      
      if (matchedLot) {
        // 设置选中的停车场
        formState.selectedLotId = matchedLot.value
        
        // 编辑模式下，我们需要特殊处理
        // 如果是编辑已有记录，需要包含已占用的停车位（即当前选中的停车位）
        formState.loadingSpots = true
        
        try {
          // 获取包括所有状态的停车位（status不指定或传-1）
          const lotName = matchedLot.label
          console.log(`编辑模式：获取停车场"${lotName}"的所有停车位`)
          
          // 在编辑模式下，不需要过滤停车位状态，因为我们需要显示当前已选的停车位
          // 即使它已经被占用
          const res = await getParkingSpotsByLotName(lotName, -1)
          
          if (res.data && Array.isArray(res.data)) {
            extendedSpotOptions.value = res.data.map((item: any) => ({
              label: item.spotNumber,
              value: item.id,
              lotId: matchedLot.value
            }))
            
            // 验证是否包含当前选中的停车位
            const hasSelectedSpot = extendedSpotOptions.value.some(s => s.value === formState.model.parkingSpotId)
            
            if (!hasSelectedSpot && spot) {
              // 如果API返回的数据中没有包含当前选中的停车位，手动添加
              console.warn('API返回的数据中没有包含当前选中的停车位，手动添加')
              extendedSpotOptions.value.push({
                label: spot.label,
                value: spot.value,
                lotId: matchedLot.value,
                temporary: true
              })
            }
            
            console.log(`编辑模式：获取到${extendedSpotOptions.value.length}个停车位`, extendedSpotOptions.value)
          }
        } catch (error) {
          console.error('获取停车场所有停车位失败:', error)
          // 添加当前停车位作为唯一选项
          if (spot) {
            extendedSpotOptions.value = [{
              label: spot.label,
              value: spot.value,
              lotId: matchedLot.value
            }]
          }
        } finally {
          formState.loadingSpots = false
        }
      } else {
        console.warn(`无法为停车位 ${spot.label} 找到匹配的停车场`)
      }
    }
  }
  
  formState.initialized = true
}

// 初始化时加载停车场数据
onMounted(() => {
  getParkingLots()
})

// 是否显示所有停车位（调试用）
const showAllSpots = ref(false)

// 监听显示所有停车位的变化
watchEffect(() => {
  if (showAllSpots.value) {
    // 临时存储当前选中的停车场ID
    formState.tempLotId = formState.selectedLotId
    // 清空选中的停车场，触发显示所有停车位
    formState.selectedLotId = undefined
  } else if (formState.tempLotId !== undefined) {
    // 还原之前选中的停车场
    formState.selectedLotId = formState.tempLotId
    // 重新加载该停车场的停车位
    if (formState.selectedLotId) {
      handleLotChange(formState.selectedLotId)
    }
  }
})

// 使用计算属性处理 dialog 的显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value)
  }
})

// 添加计算属性，输出当前过滤后的停车位选项，用于调试
const currentFilteredSpotOptions = computed(() => {
  const options = filteredSpotOptions.value
  console.log('当前停车场ID:', formState.selectedLotId)
  console.log('过滤后的停车位选项:', options)
  return options
})

// 监听props变化，更新表单数据
watchEffect(() => {
  if (props.visible) {
    // 对话框打开时，初始化表单数据
    if (!formState.initialized) {
      initFormData()
    }
  } else {
    // 对话框关闭时，重置表单
    resetForm()
  }
})

// 对话框关闭处理函数
const handleDialogClosed = () => {
  formRef.value?.resetFields()
  resetForm()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="formState.model.id ? '编辑停车记录' : '新增停车记录'"
    width="500px"
    @closed="handleDialogClosed"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
  >
    <el-form
      ref="formRef"
      :model="formState.model"
      :rules="formRules"
      label-width="100px"
    >
      <!-- 调试信息 -->
      <div v-if="currentFilteredSpotOptions.length === 0 && formState.selectedLotId && !formState.loadingSpots" class="debug-info">
        <el-alert
          title="没有找到该停车场的空闲停车位"
          type="warning"
          :closable="false"
          show-icon
        >
          <p>可能原因：</p>
          <p>1. 该停车场没有空闲停车位</p>
          <p>2. API调用失败，请检查网络连接</p>
          <p>3. 后端接口返回数据格式不正确</p>
        </el-alert>
      </div>
      
      <el-form-item label="所属停车场" required>
        <el-select
          v-model="formState.selectedLotId"
          placeholder="请选择停车场"
          style="width: 100%"
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
      
      <el-form-item label="停车位" prop="parkingSpotId">
        <el-select
          v-model="formState.model.parkingSpotId"
          placeholder="请选择空闲停车位"
          style="width: 100%"
          :loading="formState.loadingSpots"
          :disabled="!formState.selectedLotId || (currentFilteredSpotOptions.length === 0 && !formState.loadingSpots)"
        >
          <template #empty>
            <div v-if="formState.loadingSpots" class="loading-tips">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在加载空闲停车位列表...</span>
            </div>
            <div v-else>
              <span>暂无空闲停车位</span>
            </div>
          </template>
          <el-option
            v-for="item in currentFilteredSpotOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="车辆" prop="vehicleId">
        <el-select
          v-model="formState.model.vehicleId"
          placeholder="请选择车辆"
          style="width: 100%"
          @change="handleVehicleChange"
        >
          <el-option
            v-for="item in vehicleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="车牌号" prop="plateNumber">
        <el-input v-model="formState.model.plateNumber" placeholder="车牌号将根据所选车辆自动填充" disabled />
      </el-form-item>
      
      <el-form-item label="入场时间" prop="entryTime">
        <el-date-picker
          v-model="formState.model.entryTime"
          type="datetime"
          placeholder="选择入场时间"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-select v-model="formState.model.status" style="width: 100%">
          <el-option label="进行中" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>
      </el-form-item>
      
      <el-form-item v-if="formState.model.status === 1" label="出场时间" prop="exitTime">
        <el-date-picker
          v-model="formState.model.exitTime"
          type="datetime"
          placeholder="选择出场时间"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.debug-info {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px dashed #e6a23c;
  border-radius: 4px;
  background-color: #fdf6ec;
}

.loading-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: #909399;
}

.loading-tips .el-icon {
  margin-right: 5px;
}
</style> 