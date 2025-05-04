import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import authUtils from './utils/auth'

// 在应用启动时初始化认证状态
authUtils.initializeAuth()

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
