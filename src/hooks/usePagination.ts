import { ref, reactive, computed } from 'vue';
import { PaginationParams } from '@/types';

export function usePagination(initParams: Partial<PaginationParams> = {}) {
  // 分页状态
  const pagination = reactive({
    page: initParams.page || 1,
    pageSize: initParams.pageSize || 10,
    total: 0
  });
  
  // 加载状态
  const loading = ref(false);
  
  // 计算总页数
  const totalPages = computed(() => 
    Math.ceil(pagination.total / pagination.pageSize)
  );
  
  // 更改页码
  const handlePageChange = (page: number) => {
    pagination.page = page;
  };
  
  // 更改每页显示数量
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    // 如果当前页大于总页数，则重置到第一页
    if (pagination.page > totalPages.value) {
      pagination.page = 1;
    }
  };
  
  // 重置分页
  const resetPagination = () => {
    pagination.page = 1;
    pagination.total = 0;
  };
  
  // 设置总数
  const setTotal = (total: number) => {
    pagination.total = total;
  };
  
  // 获取请求参数
  const getParams = () => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
  };
  
  return {
    pagination,
    loading,
    totalPages,
    handlePageChange,
    handleSizeChange,
    resetPagination,
    setTotal,
    getParams
  };
} 