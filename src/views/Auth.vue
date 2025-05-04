<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth, useFormValidation } from '@/hooks'
import { User, Lock, Message, Location, Document, Setting } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import { LoginParams } from '@/types'

const isLogin = ref(true)
const rememberMe = ref(false)

// 使用认证hook
const { loading, handleLogin, checkAuthAndRedirect } = useAuth()

// 登录表单验证
const loginFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 使用表单验证hook - 登录表单
const initialLoginForm: LoginParams = { username: '', password: '' }
const { 
  form: loginForm, 
  formRef: loginFormRef,
  formRules: loginRules,
  validateForm: validateLoginForm
} = useFormValidation(initialLoginForm, loginFormRules)

// 注册表单验证
const registerFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 使用表单验证hook - 注册表单
const initialRegisterForm = {
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
}

const { 
  form: registerForm, 
  formRef: registerFormRef,
  formRules: registerRules,
  validateForm: validateRegisterForm,
  resetForm: resetRegisterForm
} = useFormValidation(initialRegisterForm, registerFormRules)

// 切换登录/注册表单
const toggleForm = () => {
  isLogin.value = !isLogin.value
}

// 登录处理
const doLogin = async () => {
  const valid = await validateLoginForm()
  if (!valid) return
  
  await handleLogin(loginForm.value, rememberMe.value)
}

// 注册处理
const doRegister = async () => {
  const valid = await validateRegisterForm()
  if (!valid) return
  
  // 模拟注册过程
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // 切换到登录表单
    isLogin.value = true
    resetRegisterForm()
  }, 1000)
}

// 在组件挂载时检查登录状态
onMounted(() => {
  // 检查登录状态并重定向
  checkAuthAndRedirect()
})
</script>

<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="form-container" :class="{ 'slide': !isLogin }">
        <!-- 登录表单 -->
        <div class="form-panel login-panel" :class="{ 'active': isLogin }">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>请登录您的账号以继续使用停车管理系统</p>
          </div>
          
          <el-form 
            ref="loginFormRef"
            :model="loginForm" 
            :rules="loginRules" 
            label-position="top" 
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名">
                <template #prefix>
                  <el-icon><user /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="密码" show-password>
                <template #prefix>
                  <el-icon><lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <div class="form-actions">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link>忘记密码?</el-link>
            </div>
            
            <el-button type="primary" :loading="loading" @click="doLogin" class="submit-btn">登录</el-button>
            
            <div class="form-footer">
              <span>还没有账号?</span>
              <el-button link @click="toggleForm">立即注册</el-button>
            </div>
          </el-form>
        </div>
        
        <!-- 注册表单 -->
        <div class="form-panel register-panel" :class="{ 'active': !isLogin }">
          <div class="form-header">
            <h2>创建账号</h2>
            <p>注册一个新账号以使用停车管理系统</p>
          </div>
          
          <el-form 
            ref="registerFormRef"
            :model="registerForm" 
            :rules="registerRules" 
            label-position="top" 
            class="register-form"
          >
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名">
                <template #prefix>
                  <el-icon><user /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input v-model="registerForm.email" placeholder="邮箱">
                <template #prefix>
                  <el-icon><message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="密码" show-password>
                <template #prefix>
                  <el-icon><lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" show-password>
                <template #prefix>
                  <el-icon><lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-button type="primary" :loading="loading" @click="doRegister" class="submit-btn">注册</el-button>
            
            <div class="form-footer">
              <span>已有账号?</span>
              <el-button link @click="toggleForm">返回登录</el-button>
            </div>
          </el-form>
        </div>
      </div>
      
      <!-- 装饰性背景 -->
      <div class="decoration-panel" :class="{ 'slide': !isLogin }">
        <div class="decoration-content login-decoration" :class="{ 'active': isLogin }">
          <div class="decoration-text">
            <div class="decoration-header">
              <h2>欢迎使用停车管理系统</h2>
              <p>高效、智能的停车场管理解决方案</p>
            </div>
            <div class="features">
              <div class="feature-item">
                <div class="icon-container">
                  <el-icon><Location /></el-icon>
                </div>
                <span>多停车场集中管理</span>
              </div>
              <div class="feature-item">
                <div class="icon-container">
                  <el-icon><Document /></el-icon>
                </div>
                <span>智能车位分配</span>
              </div>
              <div class="feature-item">
                <div class="icon-container">
                  <el-icon><Setting /></el-icon>
                </div>
                <span>灵活的计费规则</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="decoration-content register-decoration" :class="{ 'active': !isLogin }">
          <div class="decoration-text">
            <div class="decoration-header">
              <h2>加入我们</h2>
              <p>注册账号，体验智能停车管理系统</p>
            </div>
            <div class="benefits">
              <div class="benefit-item">
                <div class="icon-container">
                  <el-icon><User /></el-icon>
                </div>
                <span>个性化用户体验</span>
              </div>
              <div class="benefit-item">
                <div class="icon-container">
                  <el-icon><Lock /></el-icon>
                </div>
                <span>安全的数据保护</span>
              </div>
              <div class="benefit-item">
                <div class="icon-container">
                  <el-icon><Message /></el-icon>
                </div>
                <span>及时的通知提醒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-box {
  width: 900px;
  max-width: 100%;
  height: 600px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
}

.form-container {
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.form-panel {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 50px 40px;
  box-sizing: border-box;
  transition: all 0.6s ease-in-out;
  opacity: 0;
  visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-panel {
  left: 0;
  transform: translateX(-100%);
}

.register-panel {
  right: 0;
  transform: translateX(100%);
}

.form-panel.active {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
  z-index: 5;
}

.form-container.slide .login-panel {
  transform: translateX(-100%);
  opacity: 0;
  visibility: hidden;
}

.form-container.slide .register-panel {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
}

/* 装饰面板样式 */
.decoration-panel {
  position: relative;
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  overflow: hidden;
  transition: all 0.6s ease-in-out;
  color: #fff;
}

.decoration-content {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 50px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  transition: all 0.6s ease-in-out;
  opacity: 0;
  visibility: hidden;
}

.decoration-text {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.login-decoration {
  left: 0;
  transform: translateX(100%);
}

.register-decoration {
  right: 0;
  transform: translateX(-100%);
}

.decoration-content.active {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
}

.decoration-panel.slide .login-decoration {
  transform: translateX(-100%);
  opacity: 0;
  visibility: hidden;
}

.decoration-panel.slide .register-decoration {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
}

.decoration-content h2 {
  color: #fff;
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.decoration-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin-bottom: 5px;
  text-align: left;
}

.features, .benefits {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: flex-start;
  text-align: left;
  width: 100%;
  margin-top: 30px;
}

.feature-item, .benefit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.icon-container {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-item .el-icon, .benefit-item .el-icon {
  font-size: 24px;
}

.feature-item span, .benefit-item span {
  font-size: 16px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  margin-top: 5px;
  padding: 12px 0;
  font-size: 16px;
}

.form-footer {
  margin-top: 15px;
  text-align: center;
}

.form-footer span {
  color: #666;
  margin-right: 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .auth-box {
    flex-direction: column;
    height: auto;
  }
  
  .form-container, .decoration-panel {
    width: 100%;
  }
  
  .form-panel {
    position: relative;
    width: 100%;
    transform: none;
    padding: 40px 20px;
  }
  
  .login-panel, .register-panel, .decoration-content {
    display: none;
  }
  
  .form-panel.active, .decoration-content.active {
    display: block;
  }
  
  .form-container.slide .login-panel,
  .form-container.slide .register-panel,
  .decoration-panel.slide .login-decoration,
  .decoration-panel.slide .register-decoration {
    transform: none;
  }
  
  .decoration-panel {
    display: none;
  }
}

.form-header, .decoration-header {
  margin-bottom: 20px;
}

.form-panel h2 {
  margin-bottom: 10px;
  font-size: 28px;
  color: #333;
}

.form-panel p {
  margin-bottom: 5px;
  color: #666;
  font-size: 15px;
}

.login-form, .register-form {
  margin-top: 0;
}

.login-form .el-form-item,
.register-form .el-form-item {
  margin-bottom: 15px;
}

.register-form .el-form-item:last-of-type {
  margin-bottom: 20px;
}

.decoration-header {
  text-align: left;
  width: 100%;
  margin-bottom: 20px;
}
</style> 