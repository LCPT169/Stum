/**
 * API 服务统一出口
 */

// 导入各模块API
import * as userApi from './user'
import * as projectApi from './project'
import * as taskApi from './task'
import * as cesiumApi from './cesium'
import * as dashboardApi from './dashboard'

// 导出API
export {
  userApi,
  projectApi,
  taskApi,
  cesiumApi,
  dashboardApi
}
