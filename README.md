# 停车场管理系统

基于Vue 3 + TypeScript + Element Plus的停车场管理系统前端项目。

## 项目特点

- 使用Vue 3 + TypeScript + Element Plus构建
- 基于Composition API设计
- 使用Vue Router进行路由管理
- 集中式状态管理（使用响应式API）
- 集成JWT token认证
- 模块化API设计

## 项目结构

```
/src
  /api        - API服务层，与后端通信
  /assets     - 静态资源文件
  /components - 通用组件
  /constants  - 常量定义
  /hooks      - 自定义Vue组合式API钩子
  /layouts    - 布局组件
  /router     - 路由配置
  /types      - TypeScript类型定义
  /utils      - 工具函数
  /views      - 页面组件
    /parking  - 停车相关页面
    /user     - 用户相关页面
    /vehicle  - 车辆相关页面
```

## 功能模块

- 停车场管理
- 停车区管理
- 停车位管理
- 停车记录管理
- 用户管理
- 车辆管理

## 开发环境

- Node.js >= 14.0.0
- Vue.js 3.x
- TypeScript 4.x
- Vite

## 安装与运行

```bash
# 安装依赖
npm install

# 本地开发服务
npm run dev

# 构建生产版本
npm run build
```

## 认证流程

项目使用JWT token进行身份认证：

1. 用户登录后获取token
2. token存储在localStorage或sessionStorage中（根据"记住我"选项）
3. 所有API请求自动附加Authorization头
4. token过期时自动跳转到登录页

## 目录结构说明

### API目录

`/src/api`目录包含与后端API通信的服务层代码。每个模块对应一个文件：

- instance.ts - Axios实例和拦截器
- auth.ts - 认证相关API
- parkingLot.ts - 停车场相关API
- parkingZone.ts - 停车区相关API
- parkingSpot.ts - 停车位相关API
- parkingRecord.ts - 停车记录相关API
- user.ts - 用户相关API
- vehicle.ts - 车辆相关API

### Hooks目录

`/src/hooks`目录包含可复用的组合式API钩子：

- useAuth.ts - 认证相关逻辑
- usePagination.ts - 分页逻辑
- useFormValidation.ts - 表单验证逻辑

### 类型目录

`/src/types`目录包含项目中使用的TypeScript类型定义。

### 常量目录

`/src/constants`目录包含项目中使用的常量定义。
