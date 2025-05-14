import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'  // 确保在Element Plus样式之后引入
import App from './App.vue'
import router from './router'
import authUtils from './utils/auth'

// 在应用启动时初始化认证状态
console.log('应用初始化，正在初始化认证状态...')
try {
  authUtils.initializeAuth()
  console.log('认证状态初始化完成，登录状态:', authUtils.isLoggedIn.value)
  console.log('当前token状态:', authUtils.token.value ? '有效' : '无效')
} catch (error) {
  console.error('认证状态初始化失败:', error)
}

const app = createApp(App)

// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
}

app.use(ElementPlus)
app.use(router)

app.mount('#app')
