# StumpageDetection 项目接口文档

本文档详细描述了StumpageDetection项目的所有API接口，包括请求方法、URL路径、请求参数和返回数据格式。

## 目录

- [1. 用户认证](#1-用户认证)
- [2. 项目管理](#2-项目管理)
- [3. 任务管理](#3-任务管理)
- [4. 文件上传](#4-文件上传)
- [5. 文件下载](#5-文件下载)
- [6. Cesium可视化](#6-cesium可视化)
- [7. 3D模型转换](#7-3d模型转换)
- [8. 系统配置](#8-系统配置)
- [9. 仪表盘](#9-仪表盘)

## 1. 用户认证

### 1.1 用户登录

- **URL**: `/api/token-auth`
- **方法**: POST
- **描述**: 用户登录并获取JWT令牌
- **请求参数**:
  ```json
  {
    "uname": "用户名",
    "pwd": "密码"
  }
  ```
- **返回数据**:
  ```json
  {
    "status": 200,
    "msg": true,
    "userInfo": {
      "uname": "用户名",
      "uid": "用户ID"
    },
    "token": "JWT令牌",
    "user": {
      // 用户完整信息
    }
  }
  ```
- **状态码**:
  - 200: 成功
  - 400: 用户名或密码错误

### 1.2 获取所有用户

- **URL**: `/api/admin/users`
- **方法**: GET
- **描述**: 获取系统中所有用户信息（仅管理员可用）
- **返回数据**:
  ```json
  {
    "count": 用户数量,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱",
        "is_superuser": true/false,
        "is_staff": true/false,
        "is_active": true/false,
        "date_joined": "加入日期",
        "last_login": "最后登录时间"
      }
    ]
  }
  ```

## 2. 项目管理

### 2.1 获取所有项目

- **URL**: `/api/project/getall`
- **方法**: POST
- **描述**: 获取用户的所有项目
- **请求参数**:
  ```json
  {
    "uid": "用户ID"
  }
  ```
- **返回数据**:
  ```json
  [
    {
      "id": "项目ID",
      "tasks": ["任务ID1", "任务ID2"],
      "created_at": "创建时间",
      "permissions": ["add", "change", "delete", "view"],
      "name": "项目名称",
      "description": "项目描述"
    }
  ]
  ```

### 2.2 获取项目详情

- **URL**: `/api/project/get`
- **方法**: POST
- **描述**: 获取单个项目的详细信息
- **请求参数**:
  ```json
  {
    "pid": "项目ID"
  }
  ```
- **返回数据**:
  ```json
  {
    "id": "项目ID",
    "tasks": ["任务ID1", "任务ID2"],
    "created_at": "创建时间",
    "permissions": ["add", "change", "delete", "view"],
    "name": "项目名称",
    "description": "项目描述"
  }
  ```

### 2.3 创建项目

- **URL**: `/api/project/create`
- **方法**: POST
- **描述**: 创建新项目
- **请求参数**:
  ```json
  {
    "uid": "用户ID",
    "pname": "项目名称",
    "description": "项目描述"
  }
  ```
- **返回数据**:
  ```json
  {
    "pid": "项目ID",
    "uid": "用户ID",
    "pname": "项目名称",
    "description": "项目描述",
    "createTime": "创建时间"
  }
  ```

### 2.4 删除项目

- **URL**: `/api/project/delete`
- **方法**: POST
- **描述**: 删除指定项目
- **请求参数**:
  ```json
  {
    "pid": "项目ID"
  }
  ```
- **返回数据**: 被删除的项目ID

### 2.5 编辑项目

- **URL**: `/api/project/edit`
- **方法**: POST
- **描述**: 编辑项目信息
- **请求参数**:
  ```json
  {
    "pid": "项目ID",
    "pname": "新项目名称",
    "description": "新项目描述"
  }
  ```
- **返回数据**: "true"表示成功，"false"表示失败

## 3. 任务管理

### 3.1 创建任务

- **URL**: `/api/task/create`
- **方法**: POST
- **描述**: 创建新任务
- **请求参数**:
  ```json
  {
    "tid": "任务ID",
    "rid": "仓库ID",
    "pid": "项目ID",
    "tname": "任务名称",
    "process": 0.0,
    "status": "NULL",
    "updateTime": "更新时间"
  }
  ```
- **返回数据**: 创建的任务对象

### 3.2 更新任务

- **URL**: `/api/task/update`
- **方法**: GET
- **描述**: 更新任务状态和进度
- **请求参数**:
  - `tid`: 任务ID
  - `process`: 任务进度（0-100的浮点数）
  - `status`: 任务状态
- **返回数据**: 无

### 3.3 删除任务

- **URL**: `/api/task/delete`
- **方法**: POST
- **描述**: 删除指定任务
- **请求参数**:
  ```json
  {
    "tid": "任务ID"
  }
  ```
- **返回数据**: 被删除的任务ID

### 3.4 获取项目的所有任务

- **URL**: `/api/task/getall`
- **方法**: POST
- **描述**: 获取项目下的所有任务
- **请求参数**:
  ```json
  {
    "pid": "项目ID"
  }
  ```
- **返回数据**: 任务列表，包含详细信息

### 3.5 根据名称获取任务ID

- **URL**: `/api/task/getid`
- **方法**: POST
- **描述**: 根据任务名称获取任务ID
- **请求参数**:
  ```json
  {
    "tname": "任务名称"
  }
  ```
- **返回数据**:
  ```json
  {
    "tid": "任务ID"
  }
  ```

### 3.6 根据任务ID获取仓库ID

- **URL**: `/api/task/getrid`
- **方法**: POST
- **描述**: 根据任务ID获取对应的仓库ID
- **请求参数**:
  ```json
  {
    "tid": "任务ID"
  }
  ```
- **返回数据**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```

## 4. 文件上传

### 4.1 初始化上传

- **URL**: `/api/upload/init`
- **方法**: POST
- **描述**: 初始化文件上传，创建仓库
- **请求参数**:
  ```json
  {
    "uid": "用户ID"
  }
  ```
- **返回数据**: 创建的仓库ID (rid)

### 4.2 上传文件

- **URL**: `/api/upload/upload`
- **方法**: POST
- **描述**: 上传文件到指定仓库
- **请求参数**:
  - `uploadFile`: 文件列表（multipart/form-data）
  - `rid`: 仓库ID
- **返回数据**: 上传状态，"true"表示成功

## 5. 文件下载

### 5.1 下载DEM文件

- **URL**: `/api/assert/dem`
- **方法**: POST
- **描述**: 下载数字高程模型文件
- **请求参数**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```
- **返回数据**: DEM文件流

### 5.2 下载正射影像

- **URL**: `/api/assert/ortho`
- **方法**: POST
- **描述**: 下载正射影像文件
- **请求参数**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```
- **返回数据**: 正射影像文件流

### 5.3 下载检测结果

- **URL**: `/api/assert/detect`
- **方法**: POST
- **描述**: 下载YOLO检测结果图像
- **请求参数**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```
- **返回数据**: 检测结果图像文件流

## 6. Cesium可视化

### 6.1 获取3D模型路径

- **URL**: `/api/cesium/tileset`
- **方法**: POST
- **描述**: 获取3D Tiles模型的路径
- **请求参数**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```
- **返回数据**:
  ```json
  {
    "tilesetPath": "3D Tiles路径"
  }
  ```

### 6.2 获取树桩检测信息

- **URL**: `/api/cesium/info`
- **方法**: POST
- **描述**: 获取YOLO树桩检测结果
- **请求参数**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```
- **返回数据**:
  ```json
  {
    "center": {
      "longitude": 经度,
      "latitude": 纬度,
      "elevation": 高程
    },
    "tree": [
      {
        "name": 树桩编号,
        "height": 高度,
        "guanfu": 冠幅,
        "dbh": 胸径,
        "top_latitude": 顶部纬度,
        "top_longitude": 顶部经度,
        "but_latitude": 底部纬度,
        "but_longitude": 底部经度,
        "tree_elevation": 树桩海拔
      }
    ]
  }
  ```

### 6.3 获取系统资源使用情况

- **URL**: `/api/system/info`
- **方法**: GET
- **描述**: 获取系统资源使用情况
- **返回数据**:
  ```json
  {
    "taskNumber": 任务总数,
    "taskNotRunning": 未运行任务数,
    "taskRunning": 运行中任务数,
    "taskCompromised": 异常任务数,
    "taskCompleted": 完成任务数,
    "storageSpace": 存储空间总量(GB),
    "storageSpaceUsed": 已用存储空间(GB),
    "storageSpaceUnUsed": 可用存储空间(GB),
    "memorySpace": 内存总量(GB),
    "memorySpaceUsed": 已用内存(GB),
    "memorySpaceUnUsed": 可用内存(GB)
  }
  ```

## 7. 3D模型转换

### 7.1 创建3D Tiles

- **URL**: `/api/convert/tileset`
- **方法**: POST
- **描述**: 将OBJ模型转换为Cesium 3D Tiles格式
- **请求参数**:
  ```json
  {
    "rid": "仓库ID"
  }
  ```
- **返回数据**: "finished"表示转换完成

## 8. 系统配置

### 8.1 获取任务运行路径

- **URL**: `/api/get/runtaskpath`
- **方法**: GET
- **描述**: 获取任务运行相关的路径配置
- **返回数据**:
  ```json
  {
    "outputRoot": "输出根目录",
    "repoRoot": "仓库根目录"
  }
  ```

### 8.2 获取输出路径

- **URL**: `/api/get/outputloc`
- **方法**: GET
- **描述**: 获取输出目录路径
- **返回数据**:
  ```json
  {
    "outputRoot": "输出根目录"
  }
  ```

### 8.3 获取检测路径

- **URL**: `/api/get/detect`
- **方法**: GET
- **描述**: 获取检测相关的路径配置
- **返回数据**:
  ```json
  {
    "outputRoot": "输出根目录",
    "dsm": "DSM文件路径",
    "ortho": "正射影像路径",
    "yoloRoot": "YOLO根目录"
  }
  ```

## 9. 仪表盘

### 9.1 获取仪表盘统计数据

- **URL**: `/dashboard/stats`
- **方法**: GET
- **描述**: 获取仪表盘统计数据，包括项目、任务和存储使用情况
- **返回数据**:
  ```json
  {
    "projectStats": {
      "total": 项目总数,
      "new": 新增项目数,
      "growth": 增长率
    },
    "taskStats": {
      "total": 任务总数,
      "completed": 已完成任务数,
      "pending": 待处理任务数
    },
    "storageStats": {
      "total": 存储总量(MB),
      "used": 已用存储(MB),
      "free": 可用存储(MB)
    }
  }
  ```

## 附录：系统配置

系统配置文件`application.yaml`中的关键配置项：

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
  env:
    obj23dtiles-bin: "D:/Stu/StumdetRoot/bin/obj23dtiles/bin/obj23dtiles.js"
    obj23dtiles-output: "Batchedodm_textured_model_geo/"
    tileset: "tileset.json"
  yolo:
    root: "D:/Stu/YoloDetect/"
    detect-res: "/odm_orthophoto.tif"
    detect-json: "/tree_coordinate.json"
```

## 注意事项

1. 所有API请求均需要在请求头中包含JWT令牌（除登录接口外）
2. 所有POST请求的Content-Type应为application/json，除文件上传接口外
3. 文件上传接口使用multipart/form-data格式
4. 所有接口均支持跨域请求（CORS）
5. 所有API路径前缀为`/api`，仪表盘API路径前缀为`/dashboard`
