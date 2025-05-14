<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const closeDialog = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="测试对话框"
    width="400px"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
  >
    <div>这是一个测试对话框</div>
    <template #footer>
      <el-button @click="closeDialog">关闭</el-button>
    </template>
  </el-dialog>
</template> 