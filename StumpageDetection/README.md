# StumpageDetection 后端系统文档

## 项目概述

StumpageDetection 是一个基于 Spring Boot 构建的树桩检测系统后端，提供了树桩检测、项目管理、任务处理、3D模型生成与可视化等功能的API接口。系统集成了多种技术，包括 Docker 容器化、GIS 数据处理、图像处理以及 3D 模型转换等，为前端应用提供全面的数据支持和业务逻辑处理。

## 技术栈

- **核心框架**：Spring Boot 2.6.3
- **数据库**：MySQL + MyBatis
- **数据库连接池**：Druid 1.1.21
- **安全认证**：JWT (java-jwt 3.19.1)
- **容器化**：Docker Java API (docker-java 3.2.7)
- **文件处理**：Commons IO 2.6, Commons FileUpload 1.4
- **日志系统**：Log4j 2.14.1
- **系统监控**：OSHI 3.12.2
- **其他工具**：
  - Lombok (简化代码)
  - Jackson (JSON处理)
  - AOP (面向切面编程)
  - Thymeleaf (模板引擎)

## 项目结构

```
StumpageDetection/
├── src/                           # 源代码目录
│   ├── main/
│   │   ├── java/com/stumdet/      # Java代码
│   │   │   ├── aop/               # 切面定义
│   │   │   ├── config/            # 配置类
│   │   │   ├── controller/        # 控制器
│   │   │   ├── dto/               # 数据传输对象
│   │   │   ├── mapper/            # MyBatis映射接口
│   │   │   ├── pojo/              # 实体类
│   │   │   ├── service/           # 服务层
│   │   │   ├── utils/             # 工具类
│   │   │   └── StumpageApplication.java  # 应用入口
│   │   └── resources/             # 资源文件
│   │       ├── mybatis/           # MyBatis配置和映射
│   │       ├── static/            # 静态资源
│   │       └── templates/         # Thymeleaf模板
│   └── test/                      # 测试代码
├── application.yaml               # 应用配置文件
├── pom.xml                        # Maven依赖管理
├── stumdetdb.sql                  # 数据库初始化脚本
└── README.md                      # 项目文档
```

## 核心功能模块

### 1. 用户认证与授权

- 用户登录/注册
- JWT令牌生成与验证
- 权限控制

### 2. 项目管理

- 项目创建、查询、更新和删除
- 项目详情查看
- 项目状态管理

### 3. 任务处理

- 任务创建与分配
- 任务状态监控
- 任务执行结果管理
- 异步任务处理

### 4. 文件管理

- 图像上传与存储
- 文件下载
- 大文件分片处理

### 5. 3D模型处理

- ODM (OpenDroneMap) 输出处理
- 3D模型转换 (OBJ到3D Tiles)
- Cesium兼容的tileset生成

### 6. 树桩检测

- 基于YOLO的树桩检测
- 检测结果坐标转换
- 检测结果可视化

### 7. 系统监控与仪表盘

- 系统资源监控
- 项目和任务统计
- 活动日志记录

## 数据库设计

系统使用MySQL数据库，主要包含以下表：

1. **用户表** - 存储用户信息
2. **项目表** - 存储项目信息
3. **任务表** - 存储任务信息
4. **图像仓库表** - 存储上传的图像信息
5. **检测结果表** - 存储树桩检测结果

## API接口说明

### 用户相关接口

- `/api/user/login` - 用户登录
- `/api/user/register` - 用户注册
- `/api/user/info` - 获取用户信息

### 项目相关接口

- `/project/getall` - 获取所有项目
- `/project/get` - 获取项目详情
- `/project/add` - 创建新项目
- `/project/update` - 更新项目信息
- `/project/delete` - 删除项目

### 任务相关接口

- `/task/getbyproject` - 获取项目下的任务
- `/task/get` - 获取任务详情
- `/task/add` - 创建新任务
- `/task/restart` - 重启任务
- `/task/cancel` - 取消任务

### 仪表盘相关接口

- `/dashboard/stats` - 获取仪表盘统计数据
- `/dashboard/activities` - 获取最近活动
- `/dashboard/project-trends` - 获取项目趋势数据
- `/dashboard/task-stats` - 获取任务统计数据
- `/dashboard/storage-stats` - 获取存储统计数据

### Cesium相关接口

- `/api/cesium/tileset` - 获取3D Tiles模型
- `/api/cesium/config` - 获取Cesium配置

### 文件相关接口

- `/api/upload/image` - 上传图像
- `/api/download/file` - 下载文件

## 配置说明

系统的主要配置在`application.yaml`文件中，包括：

### 服务器配置

```yaml
server:
  port: 8080 # 服务端口
  tomcat:
    uri-encoding: UTF-8
```

### 数据库配置

```yaml
spring:
  datasource:
    username: root # MySQL用户名
    password: 123456 # MySQL密码
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/stumdetdb?useUnicode=true&serverTimezone=GMT%2B8&characterEncoding=UTF-8
    type: com.alibaba.druid.pool.DruidDataSource
```

### 文件上传配置

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 16384MB # 单个文件体积上限
      max-request-size: 16384MB # 一次请求体积上限
```

### 核心功能配置

```yaml
core:
  root: "D:/Stu/StumdetRoot/"
  image-upload:
    upload-path: "D:/Stu/StumdetRoot/ImageRepo/"
    tmp-path: "D:/Stu/StumdetRoot/.tmp/"
  odm:
    output-location: "D:/Stu/StumdetRoot/ODMOutputRoot/"
    dem-name: "/odm_dem/dsm.tif"
    ort-name: "/odm_orthophoto/odm_orthophoto.tif"
    tex-name: "/odm_texturing/"
    obj-name: "/odm_texturing/odm_textured_model_geo.obj"
  jwt:
    secret-key: "token!8p&j2@Am#"
  yolo:
    root: "D:/Stu/YoloDetect/"
    detect-res: "/odm_orthophoto.tif"
    detect-json: "/tree_coordinate.json"
```

## 开发指南

### 环境要求

- JDK 1.8+
- Maven 3.6+
- MySQL 5.7+
- Docker (可选，用于容器化部署)

### 构建与运行

1. 克隆项目到本地
2. 创建MySQL数据库，执行`stumdetdb.sql`脚本初始化数据库
3. 修改`application.yaml`中的数据库连接信息和文件路径配置
4. 使用Maven构建项目：

```bash
mvn clean package
```

5. 运行应用：

```bash
java -jar target/stumpage-0.0.1-SNAPSHOT.jar
```

或者使用Spring Boot Maven插件：

```bash
mvn spring-boot:run
```

### Docker部署

1. 构建Docker镜像：

```bash
docker build -t stumpage-detection .
```

2. 运行容器：

```bash
docker run -d -p 8080:8080 --name stumpage-app stumpage-detection
```

## 注意事项

1. 系统依赖外部工具如obj23dtiles进行3D模型转换，请确保相关工具已正确安装并配置路径
2. 文件存储路径需要有足够的磁盘空间和读写权限
3. 对于大文件上传，可能需要调整服务器和Nginx的相关配置
4. JWT密钥应在生产环境中妥善保管，避免泄露

## 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否正常运行
   - 确认数据库连接信息是否正确
   - 检查数据库用户权限

2. **文件上传失败**
   - 检查文件存储路径是否存在且有写入权限
   - 确认文件大小是否超过配置的限制
   - 检查磁盘空间是否充足

3. **3D模型转换失败**
   - 检查obj23dtiles工具路径是否正确
   - 确认源文件格式是否符合要求
   - 查看日志获取详细错误信息

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)
