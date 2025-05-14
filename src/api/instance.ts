import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import authUtils from '@/utils/auth';
import router from '@/router';
import { API_CONFIG, RESPONSE_CODE, ROUTE_PATHS } from '@/constants';

// 创建Axios实例
const instance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.url);
    
    // 使用认证工具获取token
    const token = authUtils.getToken();
    
    if (token) {
      // 确保token不为null或undefined
      console.log('使用token:', token.substring(0, 20) + '...');
      // 设置Authorization头
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('没有可用的token，请求将不包含Authorization头');
      // 如果没有token，确保不发送"Bearer null"
      delete config.headers.Authorization;
      
      // 检查当前路由，如果不是登录页且认为用户应该已登录，可能需要重新认证
      try {
        const currentPath = router.currentRoute.value.path;
        const isAuthPath = currentPath === ROUTE_PATHS.AUTH;
        const shouldBeAuthenticated = authUtils.isLoggedIn.value;
        
        if (shouldBeAuthenticated && !isAuthPath) {
          console.warn('检测到潜在的认证问题：系统认为用户已登录，但找不到token');
        }
      } catch (err) {
        console.error('路由检查失败:', err);
      }
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.config.url, response.status);
    
    const { data } = response;
    console.log('响应数据类型:', typeof data);
    if (data && typeof data === 'object') {
      console.log('响应数据结构:', Object.keys(data));
    }
    
    // 确保返回的数据包含code字段再进行处理
    if (data && 'code' in data) {
      console.log('响应code:', data.code);
      if (data.code === RESPONSE_CODE.SUCCESS) {
        return data;
      } else if (data.code === RESPONSE_CODE.UNAUTHORIZED) {
        // 处理业务层面的未授权（如token过期）
        handleUnauthorized('登录已过期，请重新登录');
        return Promise.reject(new Error(data.message || '登录已过期'));
      } else {
        // 这里不显示错误消息，交给业务代码处理
        return Promise.reject(new Error(data.message || '请求失败'));
      }
    }
    // 不包含code字段的情况，直接返回响应的data
    return data;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      
      // 处理HTTP 401未授权错误
      if (status === RESPONSE_CODE.UNAUTHORIZED) {
        // 打印详细错误信息
        console.error('收到401未授权响应:', {
          url: config?.url,
          method: config?.method,
          status,
          responseData: error.response.data
        });
        
        // 避免重复处理（如果已经在业务层面处理过）
        if (error.message !== '登录已过期') {
          // 获取当前请求的URL，用于日志
          const requestUrl = config?.url || '未知URL';
          console.warn(`请求 ${requestUrl} 返回401，可能是登录已过期`);
          
          // 处理未授权情况
          handleUnauthorized('登录已过期，请重新登录');
        }
      } else if (status === RESPONSE_CODE.FORBIDDEN) {
        // 处理403禁止访问
        ElMessage.error('您没有权限访问此资源');
      } else if (status === RESPONSE_CODE.NOT_FOUND) {
        // 处理404资源不存在
        ElMessage.error('请求的资源不存在');
      } else if (status >= 500) {
        // 处理服务器错误
        ElMessage.error('服务器内部错误，请稍后重试');
      } else {
        // 处理其他错误
        ElMessage.error(error.response.data?.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络连接异常，请检查网络设置');
    } else {
      // 请求配置出错
      ElMessage.error('请求配置错误: ' + (error.message || '未知错误'));
    }
    return Promise.reject(error);
  }
);

// 处理未授权情况的辅助函数
const handleUnauthorized = (message: string) => {
  console.log('handleUnauthorized被调用，message:', message);
  
  // 显示错误消息
  try {
    ElMessage.closeAll(); // 关闭所有已有消息
    ElMessage({
      message,
      type: 'error',
      duration: 5000,
      showClose: true
    });
  } catch (err) {
    console.error('显示消息失败:', err);
  }
  
  // 使用认证工具清除登录状态
  try {
    console.log('清除认证状态');
    authUtils.clearAuth();
  } catch (err) {
    console.error('清除认证状态失败:', err);
  }
  
  // 强制延时确保UI更新
  setTimeout(() => {
    try {
      // 获取当前路由
      const currentPath = router.currentRoute.value.path;
      console.log('当前路径:', currentPath);
      
      // 如果当前不在登录页，则跳转到登录页
      if (currentPath !== ROUTE_PATHS.AUTH) {
        console.log(`登录已过期，从 ${currentPath} 重定向到登录页`);
        
        // 使用replace而不是push，避免用户点击返回按钮时回到需要认证的页面
        router.replace({
          path: ROUTE_PATHS.AUTH,
          // 可以添加查询参数，记录用户之前访问的页面
          query: { redirect: currentPath }
        }).catch(err => {
          console.error('路由跳转失败，尝试强制跳转:', err);
          // 如果路由跳转失败，尝试强制刷新到登录页
          window.location.href = ROUTE_PATHS.AUTH;
        });
      } else {
        console.log('已经在登录页面，无需跳转');
      }
    } catch (err) {
      console.error('路由处理失败:', err);
      // 出现错误时强制跳转
      window.location.href = ROUTE_PATHS.AUTH;
    }
  }, 100); // 短暂延时确保UI更新
};

// 添加泛型支持的请求函数
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config) as unknown as Promise<T>;
};

export default request; 