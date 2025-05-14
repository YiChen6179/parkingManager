import { ref, readonly } from 'vue';
import { UserInfo } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// 创建响应式的认证状态
const token = ref<string | null>(null);
const userInfo = ref<UserInfo | null>(null);
const isLoggedIn = ref(false);

// 初始化状态（从localStorage获取）
const initializeAuth = (): void => {
  console.log('初始化认证状态...');
  
  // 尝试从storage获取token
  const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  
  console.log('localStorage中的token:', localToken ? '存在' : '不存在');
  console.log('sessionStorage中的token:', sessionToken ? '存在' : '不存在');
  
  // 优先使用localStorage中的token（"记住我"选项）
  if (localToken) {
    console.log('使用localStorage中的token初始化');
    token.value = localToken;
  } 
  // 其次使用sessionStorage中的token
  else if (sessionToken) {
    console.log('使用sessionStorage中的token初始化');
    token.value = sessionToken;
  }

  // 尝试从storage获取用户信息
  const localUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  const sessionUserInfo = sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
  
  // 优先使用与token来源相同的存储
  let userInfoStr = null;
  if (localToken && localUserInfo) {
    userInfoStr = localUserInfo;
  } else if (sessionToken && sessionUserInfo) {
    userInfoStr = sessionUserInfo;
  } else {
    userInfoStr = localUserInfo || sessionUserInfo;
  }
  
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr);
      console.log('成功解析用户信息');
    } catch (e) {
      console.error('解析用户信息失败:', e);
    }
  }

  // 检查登录状态
  const loggedInStorage = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  const loggedInSession = sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  isLoggedIn.value = loggedInStorage || loggedInSession;
  console.log('登录状态:', isLoggedIn.value ? '已登录' : '未登录');

  // 同步状态（如果token存在但登录状态不一致）
  if (token.value && !isLoggedIn.value) {
    console.log('发现token但登录状态为false，正在同步...');
    isLoggedIn.value = true;
    const preferSession = !localStorage.getItem(STORAGE_KEYS.TOKEN) && !!sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    if (preferSession) {
      sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    } else {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    }
  } else if (!token.value && isLoggedIn.value) {
    // 如果没有token但有登录状态，清除登录状态
    console.log('发现登录状态为true但没有token，正在重置登录状态...');
    isLoggedIn.value = false;
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  }
  
  console.log('认证状态初始化完成，token:', token.value ? '有效' : '无效', '登录状态:', isLoggedIn.value);
};

// 设置token和登录状态
const setAuth = (newToken: string, newUserInfo: UserInfo, rememberMe: boolean = false): void => {
  console.log('设置认证信息，rememberMe:', rememberMe);
  console.log('设置token:', newToken.substring(0, 20) + '...');
  
  // 清除之前的认证信息
  clearAuth();

  // 保存新token和用户信息
  token.value = newToken;
  userInfo.value = newUserInfo;
  isLoggedIn.value = true;

  // 根据rememberMe决定存储位置
  const storage = rememberMe ? localStorage : sessionStorage;
  
  try {
    storage.setItem(STORAGE_KEYS.TOKEN, newToken);
    storage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(newUserInfo));
    storage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    
    // 验证保存是否成功
    const savedToken = storage.getItem(STORAGE_KEYS.TOKEN);
    if (savedToken === newToken) {
      console.log('token成功保存到', rememberMe ? 'localStorage' : 'sessionStorage');
    } else {
      console.error('token保存失败，期望:', newToken.substring(0, 20) + '...', '实际:', savedToken ? (savedToken.substring(0, 20) + '...') : 'null');
    }
  } catch (error) {
    console.error('保存认证信息失败:', error);
    // 尝试使用另一种存储方式
    try {
      const fallbackStorage = rememberMe ? sessionStorage : localStorage;
      fallbackStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      fallbackStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(newUserInfo));
      fallbackStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      console.log('使用备用存储方式成功保存token');
    } catch (fallbackError) {
      console.error('备用存储方式也失败了:', fallbackError);
    }
  }
};

// 清除认证状态
const clearAuth = (): void => {
  console.log('清除认证状态');
  
  // 清除内存中的状态
  token.value = null;
  userInfo.value = null;
  isLoggedIn.value = false;
  
  try {
    // 从localStorage清除
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    console.log('已清除localStorage中的认证信息');
  } catch (error) {
    console.error('清除localStorage失败:', error);
  }
  
  try {
    // 从sessionStorage清除
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    console.log('已清除sessionStorage中的认证信息');
  } catch (error) {
    console.error('清除sessionStorage失败:', error);
  }
  
  // 验证清除是否成功
  const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  
  if (localToken || sessionToken) {
    console.error('清除token失败，localStorage:', localToken ? '仍有token' : '已清除', 'sessionStorage:', sessionToken ? '仍有token' : '已清除');
  } else {
    console.log('token清除成功');
  }
};

// 获取当前token
const getToken = (): string | null => {
  // 添加调试输出
  console.log('获取token，内存中的token值:', token.value);
  
  // 如果内存中有token，直接返回
  if (token.value) {
    return token.value;
  }
  
  // 如果内存中没有token，尝试从存储中获取
  const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  
  console.log('localStorage中的token:', localToken ? '存在' : '不存在');
  console.log('sessionStorage中的token:', sessionToken ? '存在' : '不存在');
  
  // 优先使用localStorage中的token（因为这通常是"记住我"的选项）
  if (localToken) {
    console.log('使用localStorage中的token');
    token.value = localToken;
    return localToken;
  }
  
  // 其次使用sessionStorage中的token
  if (sessionToken) {
    console.log('使用sessionStorage中的token');
    token.value = sessionToken;
    return sessionToken;
  }
  
  // 如果都没有，返回null
  console.log('没有找到有效的token');
  return null;
};

// 检查是否已登录
const checkIsLoggedIn = (): boolean => {
  // 首先检查内存中的状态
  let authenticated = isLoggedIn.value && !!token.value;
  
  // 如果内存中显示未登录，但存储中可能有token，尝试从存储中恢复
  if (!authenticated) {
    const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const localLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const sessionLoggedIn = sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    console.log('检查登录状态 - localStorage登录:', localLoggedIn, 'token:', !!localToken);
    console.log('检查登录状态 - sessionStorage登录:', sessionLoggedIn, 'token:', !!sessionToken);
    
    // 如果存储中有token和登录状态，尝试恢复
    if ((localToken && localLoggedIn) || (sessionToken && sessionLoggedIn)) {
      console.log('从存储中恢复登录状态');
      // 更新内存中的状态
      token.value = localToken || sessionToken;
      isLoggedIn.value = true;
      
      // 尝试也恢复用户信息
      try {
        const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO) || sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (userInfoStr) {
          userInfo.value = JSON.parse(userInfoStr);
        }
      } catch (error) {
        console.error('恢复用户信息失败:', error);
      }
      
      authenticated = true;
    }
    // 不要清除存储中的状态，避免意外登出
  }
  
  console.log('检查登录状态:', authenticated ? '已登录' : '未登录', 'token:', token.value ? '有效' : '无效');
  return authenticated;
};

// 获取用户信息
const getUserInfo = (): UserInfo | null => {
  return userInfo.value;
};

// 测试401处理的辅助函数（仅用于开发环境）
const testUnauthorizedResponse = (): void => {
  console.log('模拟401未授权响应...');
  // 故意设置无效token
  token.value = 'invalid_token_for_testing';
  console.log('设置了无效token用于测试');
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
  getUserInfo,
  // 开发环境工具
  testUnauthorizedResponse
};

// 默认导出
export default authUtils; 