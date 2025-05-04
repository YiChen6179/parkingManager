import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

export function useFormValidation<T extends object>(initialForm: T, rules: FormRules) {
  // 表单引用
  const formRef = ref<FormInstance>();
  
  // 表单数据
  const form = ref<T>({ ...initialForm });
  
  // 表单验证规则
  const formRules = rules;
  
  // 验证表单
  const validateForm = async (): Promise<boolean> => {
    if (!formRef.value) return false;
    
    return await formRef.value.validate()
      .then(() => true)
      .catch(() => false);
  };
  
  // 重置表单
  const resetForm = () => {
    if (!formRef.value) return;
    
    formRef.value.resetFields();
    form.value = { ...initialForm };
  };
  
  // 设置表单数据
  const setFormData = (data: Partial<T>) => {
    form.value = { ...form.value, ...data };
  };
  
  // 获取表单数据
  const getFormData = (): T => {
    return { ...form.value };
  };
  
  return {
    formRef,
    form,
    formRules,
    validateForm,
    resetForm,
    setFormData,
    getFormData
  };
} 