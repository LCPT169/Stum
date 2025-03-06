# 树桩检测系统 (Stumpage Detection System)

## 项目概述

树桩检测系统是一个基于Spring Boot和Vue 3构建的全栈应用，用于处理、分析和可视化树桩检测数据。系统通过无人机航拍图像，结合人工智能算法进行树桩检测，并提供3D可视化展示、项目管理、任务处理等功能。

本系统由两部分组成：

1. **后端服务 (StumpageDetection)**：基于Spring Boot的RESTful API服务
2. **前端应用 (web-last-vue)**：基于Vue 3和Vite构建的现代化Web应用

## 系统架构

```
树桩检测系统
├── 前端 (web-last-vue)
│   ├── Vue 3 + Vite
│   ├── Element Plus UI
│   ├── Cesium 3D地图
│   ├── Axios HTTP客户端
│   └── Pinia状态管理
└── 后端 (StumpageDetection)
    ├── Spring Boot
    ├── MySQL + MyBatis
    ├── Docker容器化
    ├── YOLO树桩检测
    └── 3D模型处理
```

## 核心功能

### 1. 项目管理

- 项目创建、查询、更新和删除
- 项目详情查看与统计
- 项目文件管理

### 2. 任务处理

- 任务创建与分配
- 任务状态监控
- 任务执行结果管理
- 异步任务处理

### 3. 3D可视化

- 基于Cesium的三维地图可视化
- 正射影像展示
- 点云数据渲染
- 树桩位置标记
- 空间测量工具

### 4. 树桩检测

- 基于YOLO的树桩检测
- 检测结果坐标转换
- 检测结果可视化

### 5. 系统监控与仪表盘

- 系统资源监控
- 项目和任务统计
- 活动日志记录

## 技术栈

### 前端 (web-last-vue)

- **核心框架**：Vue 3.5.13
- **构建工具**：Vite 6.2.0
- **状态管理**：Pinia 2.1.7
- **路由管理**：Vue Router 4.2.5
- **UI 组件库**：Element Plus 2.5.6
- **HTTP 客户端**：Axios 1.6.7
- **3D 地图引擎**：Cesium 1.127.0
- **图表可视化**：ECharts 5.6.0

### 后端 (StumpageDetection)

- **核心框架**：Spring Boot 2.6.3
- **数据库**：MySQL + MyBatis
- **数据库连接池**：Druid 1.1.21
- **安全认证**：JWT (java-jwt 3.19.1)
- **容器化**：Docker Java API (docker-java 3.2.7)
- **文件处理**：Commons IO 2.6, Commons FileUpload 1.4
- **日志系统**：Log4j 2.14.1

## 系统部署

### 环境要求

- **后端**：
  - JDK 1.8+
  - Maven 3.6+
  - MySQL 5.7+
  - Docker (可选，用于容器化部署)

- **前端**：
  - Node.js >= 16.0.0
  - npm >= 8.0.0

### 后端部署

1. 创建MySQL数据库，执行`stumdetdb.sql`脚本初始化数据库：

```bash
mysql -u root -p < stumdetdb.sql
```

2. 修改`application.yaml`中的数据库连接信息和文件路径配置

3. 使用Maven构建项目：

```bash
cd StumpageDetection
mvn clean package
```

4. 运行应用：

```bash
java -jar target/stumpage-0.0.1-SNAPSHOT.jar
```

### 前端部署

1. 安装依赖：

```bash
cd web-last-vue
npm install
```

2. 开发环境启动：

```bash
npm run dev
```

3. 构建生产版本：

```bash
npm run build
```

4. 部署生产版本：
   - 将`dist`目录下的文件部署到Web服务器
   - 配置服务器将所有路由请求重定向到`index.html`

## API接口说明

### 前端API调用路径

#### 项目相关接口

- `/api/project/getall`：获取所有项目
- `/api/project/get`：获取项目详情
- `/api/project/add`：创建新项目
- `/api/project/update`：更新项目信息
- `/api/project/delete`：删除项目

#### 任务相关接口

- `/api/task/getbyproject`：获取项目下的任务
- `/api/task/get`：获取任务详情
- `/api/task/add`：创建新任务
- `/api/task/restart`：重启任务
- `/api/task/cancel`：取消任务

#### 仪表盘相关接口

- `/dashboard/stats`：获取仪表盘统计数据
- `/dashboard/activities`：获取最近活动
- `/dashboard/project-trends`：获取项目趋势数据
- `/dashboard/task-stats`：获取任务统计数据
- `/dashboard/storage-stats`：获取存储统计数据

### 后端控制器路径

#### 项目相关接口

- `/project/getall`：获取所有项目
- `/project/get`：获取项目详情
- `/project/add`：创建新项目
- `/project/update`：更新项目信息
- `/project/delete`：删除项目

#### 任务相关接口

- `/task/getbyproject`：获取项目下的任务
- `/task/get`：获取任务详情
- `/task/add`：创建新任务
- `/task/restart`：重启任务
- `/task/cancel`：取消任务

#### 仪表盘相关接口

- `/dashboard/stats`：获取仪表盘统计数据
- `/dashboard/activities`：获取最近活动
- `/dashboard/project-trends`：获取项目趋势数据
- `/dashboard/task-stats`：获取任务统计数据
- `/dashboard/storage-stats`：获取存储统计数据

> **注意**：后端配置了全局路径前缀`/api`，因此实际访问路径为`/api` + 控制器路径

## 配置说明

### 后端关键配置 (application.yaml)

```yaml
server:
  port: 8080 # 服务端口

spring:
  datasource:
    username: root # MySQL用户名
    password: 123456 # MySQL密码
    url: jdbc:mysql://localhost:3306/stumdetdb?useUnicode=true&serverTimezone=GMT%2B8&characterEncoding=UTF-8
  
  servlet:
    multipart:
      max-file-size: 16384MB # 单个文件体积上限
      max-request-size: 16384MB # 一次请求体积上限

core:
  root: "D:/Stu/StumdetRoot/"
  image-upload:
    upload-path: "D:/Stu/StumdetRoot/ImageRepo/"
    tmp-path: "D:/Stu/StumdetRoot/.tmp/"
  odm:
    output-location: "D:/Stu/StumdetRoot/ODMOutputRoot/"
  jwt:
    secret-key: "token!8p&j2@Am#"
  yolo:
    root: "D:/Stu/YoloDetect/"
```

### 前端代理配置 (vite.config.js)

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path
    }
  }
}
```

## 数据流程

1. **图像上传**：
   - 用户通过前端上传无人机航拍图像
   - 后端接收并存储图像

2. **项目创建**：
   - 用户创建新项目，关联上传的图像
   - 系统生成项目ID和相关元数据

3. **任务处理**：
   - 系统创建处理任务
   - 后端异步执行图像处理和树桩检测

4. **3D模型生成**：
   - 系统处理图像生成正射影像
   - 生成点云和3D模型
   - 转换为Cesium兼容的3D Tiles格式

5. **树桩检测**：
   - 使用YOLO算法进行树桩检测
   - 生成树桩位置坐标

6. **结果可视化**：
   - 前端加载3D模型和检测结果
   - 在Cesium地图上展示树桩位置
   - 提供测量和分析工具

## 常见问题

1. **API请求返回404错误**
   - 检查后端服务是否正常运行
   - 确认API路径是否正确
   - 检查Vite代理配置是否正确

2. **Cesium地图无法加载**
   - 检查Cesium访问令牌是否有效
   - 确认相关资源文件是否正确加载

3. **文件上传失败**
   - 检查文件存储路径是否存在且有写入权限
   - 确认文件大小是否超过配置的限制
   - 检查磁盘空间是否充足

4. **树桩检测结果不准确**
   - 检查YOLO模型配置
   - 确认图像质量和分辨率
   - 可能需要调整检测算法参数

## 系统扩展

### 添加新功能

1. **后端扩展**：
   - 在`com.stumdet.controller`包中添加新的控制器
   - 在`com.stumdet.service`包中实现业务逻辑
   - 在`com.stumdet.mapper`包中添加数据库操作

2. **前端扩展**：
   - 在`src/views`目录下添加新的页面组件
   - 在`src/api`目录下添加新的API调用
   - 在`src/router`中注册新的路由

### 性能优化

1. **后端优化**：
   - 添加缓存机制
   - 优化数据库查询
   - 使用异步处理大型任务

2. **前端优化**：
   - 实现懒加载和按需加载
   - 优化Cesium渲染性能
   - 减少不必要的API调用

