import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authUtils from '@/utils/auth';
import { login, logout } from '@/api/auth';
import { LoginParams, UserInfo } from '@/types';
import { ROUTE_PATHS } from '@/constants';

export function useAuth() {
  const router = useRouter();
  const loading = ref(false);
  
  // 计算属性：是否已登录
  const isLoggedIn = computed(() => authUtils.checkIsLoggedIn());
  
  // 计算属性：当前用户信息
  const currentUser = computed(() => authUtils.getUserInfo());
  
  // 登录方法
  const handleLogin = async (loginData: LoginParams, rememberMe: boolean = false) => {
    loading.value = true;
    
    try {
      const res = await login(loginData);
      
      if (res && typeof res === 'object') {
        // 检查响应格式
        let token = '';
        let userData: UserInfo | null = null;
        let success = false;
        
        // 处理不同格式的成功响应
        if ('code' in res && res.code === 200 && res.data) {
          token = res.data.token || '';
          userData = res.data.user;
          success = true;
        } else if ('token' in res) {
          token = (res as any).token as string;
          userData = (res as any).user;
          success = true;
        } else if ('data' in res && res.data && typeof res.data === 'object') {
          if ('token' in res.data) {
            token = res.data.token;
            userData = res.data.user;
            success = true;
          }
        }
        
        if (success && token && userData) {
          // 设置登录状态
          authUtils.setAuth(token, userData, rememberMe);
          
          ElMessage.success('登录成功');
          
          // 延迟跳转
          setTimeout(() => {
            router.push(ROUTE_PATHS.DASHBOARD);
          }, 500);
          
          return true;
        } else {
          ElMessage.error('登录失败：无法解析登录响应');
          authUtils.clearAuth();
          return false;
        }
      } else {
        ElMessage.error('登录失败：响应格式错误');
        authUtils.clearAuth();
        return false;
      }
    } catch (error: any) {
      ElMessage.error(error?.message || '登录失败，请检查用户名和密码');
      authUtils.clearAuth();
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // 登出方法
  const handleLogout = async () => {
    try {
      await logout();
      authUtils.clearAuth();
      ElMessage.success('退出登录成功');
      router.push(ROUTE_PATHS.AUTH);
      return true;
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使API调用失败，也清除本地登录状态
      authUtils.clearAuth();
      router.push(ROUTE_PATHS.AUTH);
      return false;
    }
  };
  
  // 检查登录状态并重定向
  const checkAuthAndRedirect = (requireAuth: boolean = true) => {
    const authenticated = authUtils.checkIsLoggedIn();
    
    if (requireAuth && !authenticated) {
      router.push(ROUTE_PATHS.AUTH);
      return false;
    }
    
    if (authenticated && router.currentRoute.value.path === ROUTE_PATHS.AUTH) {
      router.push(ROUTE_PATHS.DASHBOARD);
      return false;
    }
    
    return true;
  };
  
  return {
    loading,
    isLoggedIn,
    currentUser,
    handleLogin,
    handleLogout,
    checkAuthAndRedirect
  };
} 