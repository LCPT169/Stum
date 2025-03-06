# web-last-vue 项目文档

## 项目概述

web-last-vue 是一个基于 Vue 3 和 Vite 构建的现代化前端项目，专注于提供地理信息系统(GIS)和树桩检测相关的可视化和管理功能。项目集成了 Cesium 进行 3D 地图渲染，使用 Element Plus 作为 UI 组件库，并通过 Axios 与后端 API 进行通信。

## 技术栈

- **核心框架**：Vue 3.5.13
- **构建工具**：Vite 6.2.0
- **状态管理**：Pinia 2.1.7
- **路由管理**：Vue Router 4.2.5
- **UI 组件库**：Element Plus 2.5.6
- **HTTP 客户端**：Axios 1.6.7
- **3D 地图引擎**：Cesium 1.127.0
- **图表可视化**：ECharts 5.6.0
- **工具库**：
  - dayjs (日期处理)
  - lodash-es (实用工具函数)
  - @turf/turf (GIS 数据处理)
  - @vueuse/core (Vue 组合式 API 工具集)

## 项目结构

```
web-last-vue/
├── public/                 # 静态资源目录
├── src/                    # 源代码目录
│   ├── api/                # API 接口定义
│   │   ├── cesium/         # Cesium 相关 API
│   │   ├── dashboard/      # 仪表盘相关 API
│   │   ├── project/        # 项目管理相关 API
│   │   ├── task/           # 任务管理相关 API
│   │   └── user/           # 用户相关 API
│   ├── assets/             # 项目资源文件
│   ├── components/         # 公共组件
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── store/              # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── utils/              # 工具函数
│   │   ├── cesium.js       # Cesium 工具函数
│   │   └── request/        # 请求相关工具
│   ├── views/              # 页面视图组件
│   │   ├── admin/          # 管理员页面
│   │   ├── cesium/         # Cesium 地图页面
│   │   ├── dashboard/      # 仪表盘页面
│   │   ├── project/        # 项目管理页面
│   │   └── user/           # 用户相关页面
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置
├── package.json            # 项目依赖
└── README.md               # 项目文档
```

## 功能模块

### 1. 仪表盘模块

提供系统整体数据概览，包括项目统计、任务统计、存储使用情况等信息，通过图表直观展示数据趋势。

### 2. 项目管理模块

- 项目列表：展示所有项目，支持搜索、筛选和排序
- 项目详情：查看项目基本信息、进度、任务列表等
- 项目创建/编辑：创建新项目或编辑现有项目
- 项目文件管理：上传、下载和管理项目相关文件

### 3. 任务管理模块

- 任务列表：展示项目下的所有任务，支持状态筛选
- 任务详情：查看任务执行情况、日志和结果
- 任务创建/编辑：创建新任务或编辑现有任务
- 任务监控：实时监控任务执行进度和状态

### 4. Cesium 3D 可视化模块

基于 Cesium 的三维地图可视化，支持：

- 正射影像展示
- 点云数据渲染
- 树桩位置标记
- 空间测量工具
- 图层管理

### 5. 用户管理模块

- 用户登录/注册
- 用户信息管理
- 权限控制

## 开发指南

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发服务器启动

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码格式化

```bash
npm run format
```

### 代码检查

```bash
npm run lint
```

## API 接口说明

项目通过 Axios 与后端 API 进行通信，主要接口分为以下几类：

### 项目相关接口

- `/api/project/getall`：获取所有项目
- `/api/project/get`：获取项目详情
- `/api/project/add`：创建新项目
- `/api/project/update`：更新项目信息
- `/api/project/delete`：删除项目

### 任务相关接口

- `/api/task/getbyproject`：获取项目下的任务
- `/api/task/get`：获取任务详情
- `/api/task/add`：创建新任务
- `/api/task/restart`：重启任务
- `/api/task/cancel`：取消任务

### 仪表盘相关接口

- `/dashboard/stats`：获取仪表盘统计数据
- `/dashboard/activities`：获取最近活动
- `/dashboard/project-trends`：获取项目趋势数据
- `/dashboard/task-stats`：获取任务统计数据
- `/dashboard/storage-stats`：获取存储统计数据

## 部署说明

1. 执行构建命令生成生产版本：

```bash
npm run build
```

2. 将 `dist` 目录下的文件部署到 Web 服务器

3. 配置服务器将所有路由请求重定向到 `index.html`，以支持前端路由

4. 确保后端 API 服务可访问，并根据实际环境调整 API 基础路径

## 注意事项

1. Cesium 访问令牌配置在 `main.js` 中，如需更换请修改相应配置
2. 项目使用 Vite 代理配置处理跨域请求，生产环境需要在服务器端配置相应的跨域策略
3. 项目默认连接到 `http://localhost:8080` 的后端服务，如需修改请调整 `vite.config.js` 中的代理配置

## 常见问题

1. **API 请求返回 404 错误**
   - 检查后端服务是否正常运行
   - 确认 API 路径是否正确
   - 检查 Vite 代理配置是否正确

2. **Cesium 地图无法加载**
   - 检查 Cesium 访问令牌是否有效
   - 确认相关资源文件是否正确加载

3. **构建后页面空白**
   - 检查是否正确配置了基础路径
   - 确认服务器是否正确配置了路由重定向

