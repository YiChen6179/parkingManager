<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

interface QueryParams {
  current: number;
  size: number;
  spotNumber: string;
  status?: number;
  zoneId?: number;
}

const props = defineProps<{
  queryParams: QueryParams,
  parkingLotOptions: { label: string; value: number }[],
  parkingZoneOptions: { label: string; value: number; lotId: number }[]
}>()

const emit = defineEmits<{
  (e: 'search'): void;
  (e: 'reset'): void;
  (e: 'update:queryParams', params: QueryParams): void;
  (e: 'lotChange', lotId: number): void;
  (e: 'zoneChange', zoneId: number): void;
  (e: 'spotNumberInput', value: string): void;
}>()

// 停车场选择变化
const handleLotChange = (value: number) => {
  emit('lotChange', value)
}

// 停车区选择变化
const handleZoneChange = (value: number) => {
  emit('zoneChange', value)
}

// 车位编号输入处理
const handleSpotNumberInput = (value: string) => {
  emit('spotNumberInput', value)
}

// 搜索
const handleSearch = () => {
  emit('search')
}

// 重置
const handleReset = () => {
  emit('reset')
}

// 获取指定停车场的停车区
const getZonesByLotId = (lotId: number) => {
  return props.parkingZoneOptions.filter(item => item.lotId === lotId)
}

// 当前选中的停车场ID和前缀
const selectedLotId = ref<number | undefined>(undefined)
const selectedZonePrefix = ref('')
const userInputSpotNumber = ref('')
</script>

<template>
  <el-card class="search-card">
    <el-form :inline="true" :model="queryParams">
      <el-form-item label="所属停车场">
        <el-select
          v-model="selectedLotId"
          placeholder="请选择停车场"
          clearable
          style="width: 180px"
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
      <el-form-item label="所属停车区">
        <el-select
          v-model="queryParams.zoneId"
          placeholder="请选择停车区"
          clearable
          style="width: 180px"
          @change="handleZoneChange"
        >
          <el-option
            v-for="item in selectedLotId ? getZonesByLotId(selectedLotId) : parkingZoneOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="车位编号">
        <div class="spot-number-input">
          <span v-if="selectedZonePrefix" class="prefix">{{ selectedZonePrefix }}-</span>
          <el-input
            v-model="userInputSpotNumber"
            :placeholder="selectedZonePrefix ? '请输入车位号码' : '请输入车位编号'"
            clearable
            @keyup.enter="handleSearch"
            @input="handleSpotNumberInput"
          />
        </div>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="空闲" :value="0" />
          <el-option label="占用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.search-card {
  margin-bottom: 20px;
}

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