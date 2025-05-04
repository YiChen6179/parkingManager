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
      console.log('使用token:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('没有可用的token');
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
      const { status } = error.response;
      if (status === RESPONSE_CODE.UNAUTHORIZED) {
        ElMessage.error('登录已过期，请重新登录');
        // 使用认证工具清除登录状态
        authUtils.clearAuth();
        // 跳转到登录页
        router.push(ROUTE_PATHS.AUTH);
      } else {
        ElMessage.error(error.response.data?.message || '请求失败');
      }
    } else {
      ElMessage.error('网络异常，请稍后重试');
    }
    return Promise.reject(error);
  }
);

// 添加泛型支持的请求函数
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config) as unknown as Promise<T>;
};

export default request; 