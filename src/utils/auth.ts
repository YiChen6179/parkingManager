import { ref, readonly } from 'vue';
import { UserInfo } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// 创建响应式的认证状态
const token = ref<string | null>(null);
const userInfo = ref<UserInfo | null>(null);
const isLoggedIn = ref(false);

// 初始化状态（从localStorage获取）
const initializeAuth = (): void => {
  // 尝试从storage获取token
  const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  if (storedToken) {
    token.value = storedToken;
  }

  // 尝试从storage获取用户信息
  const storedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO) || sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (e) {
      console.error('解析用户信息失败:', e);
    }
  }

  // 检查登录状态
  const loggedInStorage = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  const loggedInSession = sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  isLoggedIn.value = loggedInStorage || loggedInSession;

  // 同步状态（如果token存在但登录状态不一致）
  if (token.value && !isLoggedIn.value) {
    isLoggedIn.value = true;
    const preferSession = !localStorage.getItem(STORAGE_KEYS.TOKEN) && !!sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    if (preferSession) {
      sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    } else {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    }
  } else if (!token.value && isLoggedIn.value) {
    // 如果没有token但有登录状态，清除登录状态
    isLoggedIn.value = false;
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  }
};

// 设置token和登录状态
const setAuth = (newToken: string, newUserInfo: UserInfo, rememberMe: boolean = false): void => {
  // 清除之前的认证信息
  clearAuth();

  // 保存新token和用户信息
  token.value = newToken;
  userInfo.value = newUserInfo;
  isLoggedIn.value = true;

  // 根据rememberMe决定存储位置
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.TOKEN, newToken);
  storage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(newUserInfo));
  storage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
};

// 清除认证状态
const clearAuth = (): void => {
  token.value = null;
  userInfo.value = null;
  isLoggedIn.value = false;
  
  // 从localStorage和sessionStorage都清除
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
};

// 获取当前token
const getToken = (): string | null => {
  return token.value;
};

// 检查是否已登录
const checkIsLoggedIn = (): boolean => {
  return isLoggedIn.value && !!token.value;
};

// 获取用户信息
const getUserInfo = (): UserInfo | null => {
  return userInfo.value;
};

// 导出认证工具
export const authUtils = {
  token: readonly(token),
  isLoggedIn: readonly(isLoggedIn),
  userInfo: readonly(userInfo),
  initializeAuth,
  setAuth,
  clearAuth,
  getToken,
  checkIsLoggedIn,
  getUserInfo
};

// 默认导出
export default authUtils; 