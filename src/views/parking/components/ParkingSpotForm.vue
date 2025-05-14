<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watchEffect, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
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
// 创建本地状态对象，用于表单数据处理
const formState = reactive({
  // 表单模型
  model: {
    id: undefined,
    parkingZoneId: undefined as unknown as number,
    status: 0,
    spotNumber: '',
    length: 5.5,
    width: 2.5
  } as ParkingSpotVO,
  // 选中的停车场ID
  selectedLotId: undefined as number | undefined,
  // 前缀
  selectedZonePrefix: '',
  // 用户输入的编号
  userInputSpotNumber: '',
  // 表单是否已初始化
  initialized: false
})

const formRules = reactive<FormRules>({
  parkingZoneId: [{ required: true, message: '请选择所属停车区', trigger: 'change' }],
  spotNumber: [{ required: true, message: '请输入车位编号', trigger: 'blur' }]
})

// 根据选中的停车场，过滤停车区选项
const filteredZoneOptions = computed(() => {
  if (!formState.selectedLotId) return props.parkingZoneOptions
  return props.parkingZoneOptions.filter(zone => zone.lotId === formState.selectedLotId)
})

// 停车场选择变化处理
const handleLotChange = (value: number) => {
  formState.selectedLotId = value
  // 清空已选的停车区
  formState.model.parkingZoneId = undefined as unknown as number
  // 清空前缀
  formState.selectedZonePrefix = ''
}

// 停车区选择变化处理
const handleParkingZoneChange = (value: number) => {
  if (value) {
    const zone = props.parkingZoneOptions.find(item => item.value === value)
    if (zone) {
      // 从停车区名称中提取前缀（假设格式如"A区"，取第一个字符作为前缀）
      const prefix = zone.label.charAt(0)
      formState.selectedZonePrefix = prefix
      
      // 如果用户已输入编号，则更新完整车位编号
      if (formState.userInputSpotNumber) {
        formState.model.spotNumber = `${prefix}-${formState.userInputSpotNumber}`
      } else {
        formState.model.spotNumber = ''
      }
    }
  } else {
    formState.selectedZonePrefix = ''
    formState.model.spotNumber = formState.userInputSpotNumber
  }
}

// 处理车位编号输入，自动添加前缀
const handleSpotNumberInput = (value: string) => {
  // 保存用户输入的原始值
  formState.userInputSpotNumber = value
  
  // 如果有选择停车区，且有前缀，则添加前缀
  if (formState.selectedZonePrefix) {
    // 如果用户输入的值已经包含前缀，则不重复添加
    if (value.startsWith(`${formState.selectedZonePrefix}-`)) {
      formState.model.spotNumber = value
    } else {
      // 检查用户输入是否已经包含"-"
      const parts = value.split('-')
      if (parts.length > 1 && parts[0] === formState.selectedZonePrefix) {
        // 已经是正确格式，不做处理
        formState.model.spotNumber = value
      } else {
        // 移除可能存在的前缀
        let cleanNumber = value
        if (value.includes('-')) {
          cleanNumber = value.split('-').pop() || value
        }
        formState.model.spotNumber = `${formState.selectedZonePrefix}-${cleanNumber}`
      }
    }
  } else {
    // 没有选择停车区，保持原值
    formState.model.spotNumber = value
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (formState.model.id) {
        // 编辑
        await updateParkingSpot(formState.model)
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addParkingSpot(formState.model)
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
    parkingZoneId: undefined as unknown as number,
    status: 0,
    spotNumber: '',
    length: 5.5,
    width: 2.5
  }
  formState.selectedLotId = undefined
  formState.selectedZonePrefix = ''
  formState.userInputSpotNumber = ''
  formState.initialized = false
}

// 使用计算属性处理 dialog 的显示状态
const dialogVisible = computed({
  get: () => {
    console.log('获取dialogVisible值:', props.visible)
    return props.visible
  },
  set: (value: boolean) => {
    console.log('设置dialogVisible值:', value)
    emit('update:visible', value)
  }
})

// 监听props变化，更新表单数据
watchEffect(() => {
  console.log('watchEffect触发, visible=', props.visible)
  if (props.visible) {
    // 对话框打开时，初始化表单数据
    if (!formState.initialized) {
      console.log('初始化表单数据')
      initFormData()
    }
  } else {
    // 对话框关闭时，重置表单
    console.log('重置表单数据')
    resetForm()
  }
})

// 初始化表单数据
const initFormData = () => {
  // 复制表单数据
  Object.assign(formState.model, props.formData)
  
  // 如果是编辑状态，找到对应的停车场ID
  if (formState.model.parkingZoneId) {
    const zone = props.parkingZoneOptions.find(item => item.value === formState.model.parkingZoneId)
    if (zone) {
      formState.selectedLotId = zone.lotId
    }
  } else {
    formState.selectedLotId = undefined
  }
  
  // 解析现有车位编号，提取前缀和用户输入部分
  if (props.formData.spotNumber && props.formData.spotNumber.includes('-')) {
    const parts = props.formData.spotNumber.split('-')
    formState.selectedZonePrefix = parts[0]
    formState.userInputSpotNumber = parts.slice(1).join('-')
  } else {
    formState.selectedZonePrefix = ''
    formState.userInputSpotNumber = props.formData.spotNumber || ''
  }
  
  formState.initialized = true
}

// 对话框关闭处理函数
const handleDialogClosed = () => {
  formRef.value?.resetFields()
  resetForm()
}
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    :title="formState.model.id ? '编辑停车位' : '新增停车位'"
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
      <el-form-item label="所属停车区" prop="parkingZoneId">
        <el-select
          v-model="formState.model.parkingZoneId"
          placeholder="请选择停车区"
          style="width: 100%"
          @change="handleParkingZoneChange"
          :disabled="!formState.selectedLotId"
        >
          <el-option
            v-for="item in filteredZoneOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="车位编号" prop="spotNumber">
        <div class="spot-number-input">
          <span v-if="formState.selectedZonePrefix" class="prefix">{{ formState.selectedZonePrefix }}-</span>
          <el-input 
            v-model="formState.userInputSpotNumber" 
            :placeholder="formState.selectedZonePrefix ? '请输入车位号码' : '请输入车位编号'"
            @input="handleSpotNumberInput"
          />
        </div>
      </el-form-item>
      <el-form-item label="车位状态" prop="status">
        <el-select v-model="formState.model.status" style="width: 100%">
          <el-option label="空闲" :value="0" />
          <el-option label="占用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="长度(m)" prop="length">
        <el-input-number v-model="formState.model.length" :min="0" :precision="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="宽度(m)" prop="width">
        <el-input-number v-model="formState.model.width" :min="0" :precision="1" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
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