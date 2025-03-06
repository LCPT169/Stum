/**
 * Cesium相关API
 */
import request from '@/utils/request/axios'

/**
 * 获取树木检测数据
 * @param {String} url - 数据URL
 * @param {Object} data - 请求参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回树木检测数据
 */
export function getTreeData(url, data, options) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * 检测树木（Java实现）
 * @param {Object} data - 检测参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回检测结果
 */
export function detectTreeJava(data, options) {
  return request({
    url: '/get/detect',
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 检测树木（Python实现）
 * @param {Object} data - 检测参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回检测结果
 */
export function detectTreePython(data, options) {
  return request({
    url: '/apiyolo/detect',
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 下载检测图
 * @param {Object} data - 下载参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回下载链接
 */
export function downloadDetectedImage(data, options) {
  return request({
    url: '/assert/detect',
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 获取项目地理位置数据
 * @param {Number} projectId - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目地理位置数据
 */
export function getProjectGeoData(projectId, options) {
  return request({
    url: `/projects/${projectId}/geo-data/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取项目3D模型数据
 * @param {Number} projectId - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目3D模型数据
 */
export function getProject3DModel(projectId, options) {
  return request({
    url: `/projects/${projectId}/3d-model/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取项目点云数据
 * @param {Number} projectId - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目点云数据
 */
export function getProjectPointCloud(projectId, options) {
  return request({
    url: `/projects/${projectId}/point-cloud/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取项目正射影像数据
 * @param {Number} projectId - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目正射影像数据
 */
export function getProjectOrthophoto(projectId, options) {
  return request({
    url: `/projects/${projectId}/orthophoto/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取项目高程模型数据
 * @param {Number} projectId - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目高程模型数据
 */
export function getProjectDEM(projectId, options) {
  return request({
    url: `/projects/${projectId}/dem/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取所有项目的地理位置数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回所有项目的地理位置数据
 */
export function getAllProjectsGeoData(options) {
  return request({
    url: '/projects/geo-data/',
    method: 'GET',
    ...options
  })
}

/**
 * 上传GeoJSON数据
 * @param {Number} projectId - 项目ID
 * @param {Object} data - GeoJSON数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回上传结果
 */
export function uploadGeoJSON(projectId, data, options) {
  return request({
    url: `/projects/${projectId}/upload-geojson/`,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 获取Cesium图层配置
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回Cesium图层配置
 */
export function getCesiumLayers(options) {
  return request({
    url: '/cesium/layers/',
    method: 'GET',
    ...options
  })
}

/**
 * 保存Cesium图层配置
 * @param {Object} data - 图层配置数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回保存结果
 */
export function saveCesiumLayers(data, options) {
  return request({
    url: '/cesium/layers/',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 获取任务可视化数据
 * @param {Number} projectId - 项目ID
 * @param {Number} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务可视化数据
 */
export function getTaskVisualizationData(projectId, taskId, options) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/visualization/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取任务处理结果
 * @param {Number} projectId - 项目ID
 * @param {Number} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务处理结果
 */
export function getTaskResults(projectId, taskId, options) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/results/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取任务3D模型
 * @param {Number} projectId - 项目ID
 * @param {Number} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务3D模型数据
 */
export function getTask3DModel(projectId, taskId, options) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/3d-model/`,
    method: 'GET',
    ...options
  })
}

/**
 * 执行空间测量
 * @param {Object} data - 测量数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回测量结果
 */
export function performSpatialMeasurement(data, options) {
  return request({
    url: '/cesium/measure/',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 执行空间查询
 * @param {Object} data - 查询数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回查询结果
 */
export function performSpatialQuery(data, options) {
  return request({
    url: '/cesium/query/',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 执行空间分析
 * @param {String} analysisType - 分析类型
 * @param {Object} data - 分析数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回分析结果
 */
export function performSpatialAnalysis(analysisType, data, options) {
  return request({
    url: `/cesium/analysis/${analysisType}/`,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 获取地形分析结果
 * @param {Object} data - 分析参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回地形分析结果
 */
export function getTerrainAnalysis(data, options) {
  return request({
    url: '/cesium/terrain-analysis/',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 获取视域分析结果
 * @param {Object} data - 分析参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回视域分析结果
 */
export function getViewshedAnalysis(data, options) {
  return request({
    url: '/cesium/viewshed-analysis/',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 保存场景状态
 * @param {Object} data - 场景状态数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回保存结果
 */
export function saveSceneState(data, options) {
  return request({
    url: '/cesium/scene-state/',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
}

/**
 * 加载场景状态
 * @param {Number} stateId - 场景状态ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回场景状态数据
 */
export function loadSceneState(stateId, options) {
  return request({
    url: `/cesium/scene-state/${stateId}/`,
    method: 'GET',
    ...options
  })
}

export default {
  getTreeData,
  detectTreeJava,
  detectTreePython,
  downloadDetectedImage,
  getProjectGeoData,
  getProject3DModel,
  getProjectPointCloud,
  getProjectOrthophoto,
  getProjectDEM,
  getAllProjectsGeoData,
  uploadGeoJSON,
  getCesiumLayers,
  saveCesiumLayers,
  getTaskVisualizationData,
  getTaskResults,
  getTask3DModel,
  performSpatialMeasurement,
  performSpatialQuery,
  performSpatialAnalysis,
  getTerrainAnalysis,
  getViewshedAnalysis,
  saveSceneState,
  loadSceneState
}
