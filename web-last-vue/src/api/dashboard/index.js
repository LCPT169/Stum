/**
 * 仪表盘相关API
 */
import request from '@/utils/request/axios'

/**
 * 获取系统信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回系统信息
 */
export function getSystemInfo(options) {
  return request({
    url: '/api/dashboard/info',
    method: 'GET',
    ...options
  })
}

/**
 * 获取仪表盘统计数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回仪表盘统计数据
 */
export function getDashboardStats(options) {
  return request({
    url: '/api/dashboard/stats',
    method: 'GET',
    ...options
  })
}

/**
 * 获取最近活动
 * @param {Number} limit - 限制返回数量
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回最近活动列表
 */
export function getRecentActivities(limit = 5, options) {
  return request({
    url: '/api/dashboard/activities',
    method: 'GET',
    params: { limit },
    ...options
  })
}

/**
 * 获取项目统计数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目统计数据
 */
export function getProjectStats(options) {
  return request({
    url: '/api/dashboard/project-stats',
    method: 'GET',
    ...options
  })
}

/**
 * 获取任务统计数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务统计数据
 */
export function getTaskStats(options) {
  return request({
    url: '/api/dashboard/task-stats',
    method: 'GET',
    ...options
  })
}

/**
 * 获取用户统计数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户统计数据
 */
export function getUserStats(options) {
  return request({
    url: '/api/dashboard/user-stats',
    method: 'GET',
    ...options
  })
}

/**
 * 获取存储统计数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回存储统计数据
 */
export function getStorageStats(options) {
  return request({
    url: '/api/dashboard/storage-stats',
    method: 'GET',
    ...options
  })
}

/**
 * 获取系统性能数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回系统性能数据
 */
export function getPerformanceStats(options) {
  return request({
    url: '/api/dashboard/performance',
    method: 'GET',
    ...options
  })
}

/**
 * 获取项目趋势数据
 * @param {String} period - 时间周期（day, week, month, year）
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目趋势数据
 */
export function getProjectTrends(period = 'month', options) {
  return request({
    url: '/api/dashboard/project-trends',
    method: 'GET',
    params: { period },
    ...options
  })
}

/**
 * 获取任务趋势数据
 * @param {String} period - 时间周期（day, week, month, year）
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务趋势数据
 */
export function getTaskTrends(period = 'month', options) {
  return request({
    url: '/api/dashboard/task-trends',
    method: 'GET',
    params: { period },
    ...options
  })
}
