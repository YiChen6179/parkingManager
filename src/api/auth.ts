import request from './instance';
import { ApiResponse, LoginParams, LoginResponseData } from '@/types';

// 登录接口
export function login(data: LoginParams) {
  return request<ApiResponse<LoginResponseData>>({
    url: '/api/auth/login',
    method: 'post',
    data
  });
}

// 登出接口
export function logout() {
  return request<ApiResponse<null>>({
    url: '/api/auth/logout',
    method: 'post'
  });
}

// 获取当前用户信息接口
export function getUserInfo() {
  return request<ApiResponse<LoginResponseData['user']>>({
    url: '/api/auth/me',
    method: 'get'
  });
}

// 刷新令牌接口
export function refreshToken() {
  return request<ApiResponse<{token: string}>>({
    url: '/api/auth/refresh',
    method: 'post'
  });
} 