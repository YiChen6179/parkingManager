import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authUtils from '@/utils/auth';
import { login, logout } from '@/api/auth';
import { LoginParams, UserInfo } from '@/types';
import { ROUTE_PATHS, STORAGE_KEYS } from '@/constants';

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
          // 根据您的截图显示，token在data对象中
          console.log('登录响应数据结构:', res.data);
          
          // 检查token是否直接在data中
          if (typeof res.data === 'object' && res.data !== null) {
            if ('token' in res.data) {
              token = res.data.token || '';
              // 检查用户数据是否在data.user中
              if ('user' in res.data && res.data.user) {
                userData = res.data.user;
              } else {
                // 也可能用户数据直接在data中
                // 确保数据包含必要的用户字段
                if ('id' in res.data && 'username' in res.data) {
                  userData = {
                    id: Number(res.data.id),
                    username: String(res.data.username),
                    // 可选字段
                    email: 'email' in res.data ? String(res.data.email) : '',
                    tel: 'tel' in res.data ? String(res.data.tel) : ''
                  };
                } else {
                  console.warn('登录响应中缺少用户数据');
                  userData = null;
                  success = false;
                }
              }
              success = true;
            }
          }
          
          // 调试输出
          console.log('登录成功，获取到token:', token);
          console.log('用户数据:', userData);
        } else if ('token' in res) {
          token = (res as any).token as string;
          userData = (res as any).user;
          success = true;
          
          // 调试输出
          console.log('登录成功，获取到token:', token);
          console.log('用户数据:', userData);
        } else if ('data' in res && res.data && typeof res.data === 'object') {
          if ('token' in res.data) {
            token = res.data.token;
            userData = res.data.user;
            success = true;
            
            // 调试输出
            console.log('登录成功，获取到token:', token);
            console.log('用户数据:', userData);
          }
        }
        
        if (success && token && userData) {
          // 确保token不为空
          if (!token || token.trim() === '') {
            console.error('登录响应中的token为空');
            ElMessage.error('登录失败：服务器返回的令牌无效');
            return false;
          }
          
          // 设置登录状态
          console.log('保存token到auth:', token);
          authUtils.setAuth(token, userData, rememberMe);
          
          // 验证token是否正确保存
          const savedToken = authUtils.getToken();
          console.log('验证保存的token:', savedToken);
          
          if (!savedToken) {
            console.error('token保存失败');
            ElMessage.error('登录状态保存失败，请重试');
            return false;
          }
          
          ElMessage.success('登录成功');
          
          // 获取重定向路径
          const redirectPath = router.currentRoute.value.query.redirect as string;
          const targetPath = redirectPath || ROUTE_PATHS.DASHBOARD;
          
          // 延迟跳转
          setTimeout(() => {
            router.replace(targetPath);
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
    // 先检查存储中的状态，避免意外清除登录状态
    const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const localLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const sessionLoggedIn = sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    // 直接使用存储中的状态判断是否已登录
    const storageAuthenticated = (localToken && localLoggedIn) || (sessionToken && sessionLoggedIn);
    
    // 使用认证工具检查登录状态（这会同时检查内存中的状态）
    const authenticated = storageAuthenticated || authUtils.checkIsLoggedIn();
    
    console.log('检查登录状态 - localStorage登录:', localLoggedIn, 'token:', !!localToken);
    console.log('检查登录状态 - sessionStorage登录:', sessionLoggedIn, 'token:', !!sessionToken);
    console.log('检查登录状态 - 最终状态:', authenticated);
    
    if (requireAuth && !authenticated) {
      console.log('需要认证但未登录，重定向到登录页');
      router.push(ROUTE_PATHS.AUTH);
      return false;
    }
    
    if (authenticated && router.currentRoute.value.path === ROUTE_PATHS.AUTH) {
      console.log('已登录但访问登录页，重定向到首页');
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