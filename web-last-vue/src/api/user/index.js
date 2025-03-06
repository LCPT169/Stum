/**
 * 用户相关API
 */
import request from '@/utils/request/axios'

/**
 * 获取用户列表
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户列表
 */
export function getUserList(options) {
  return request({
    url: '/admin/users/',
    method: 'GET',
    ...options
  })
}

/**
 * 获取当前用户信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回当前用户信息
 */
export function getCurrentUser(options) {
  return request({
    url: '/admin/users/current/',
    method: 'GET',
    ...options
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录信息，包含uname和pwd
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回token
 */
export function login(data, options) {
  // 确保参数名称正确
  const loginData = {
    uname: data.uname,
    pwd: data.pwd
  }
  
  return request({
    url: '/auth/token',
    method: 'POST',
    data: loginData,
    ...options
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户信息，包含username和password
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回创建结果
 */
export function createUser(data, options) {
  return request({
    url: '/admin/users/',
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 更新用户信息
 * @param {Number} id - 用户ID
 * @param {Object} data - 用户信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回更新结果
 */
export function updateUser(id, data, options) {
  return request({
    url: `/admin/users/${id}/`,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * 删除用户
 * @param {Number} id - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回删除结果
 */
export function deleteUser(id, options) {
  return request({
    url: `/admin/users/${id}/`,
    method: 'DELETE',
    ...options
  })
}

/**
 * 退出登录
 */
export function logout() {
  localStorage.removeItem('token')
}

/**
 * 获取用户详情
 * @param {Number} id - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户详情
 */
export function getUserDetail(id, options) {
  return request({
    url: `/admin/users/${id}/`,
    method: 'GET',
    ...options
  })
}

/**
 * 更新用户密码
 * @param {Number} id - 用户ID
 * @param {Object} data - 密码信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回更新结果
 */
export function updateUserPassword(id, data, options) {
  return request({
    url: `/admin/users/${id}/password/`,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 获取用户权限
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户权限
 */
export function getUserPermissions(options) {
  return request({
    url: '/admin/users/permissions/',
    method: 'GET',
    ...options
  })
}

/**
 * 获取用户角色
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户角色
 */
export function getUserRoles(options) {
  return request({
    url: '/admin/roles/',
    method: 'GET',
    ...options
  })
}

/**
 * 分配用户角色
 * @param {Number} userId - 用户ID
 * @param {Object} data - 角色信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回分配结果
 */
export function assignUserRole(userId, data, options) {
  return request({
    url: `/admin/users/${userId}/roles/`,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 获取用户项目列表
 * @param {Number} userId - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户项目列表
 */
export function getUserProjects(userId, options) {
  return request({
    url: `/admin/users/${userId}/projects/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取用户任务列表
 * @param {Number} userId - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户任务列表
 */
export function getUserTasks(userId, options) {
  return request({
    url: `/admin/users/${userId}/tasks/`,
    method: 'GET',
    ...options
  })
}

/**
 * 获取用户活动日志
 * @param {Number} userId - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户活动日志
 */
export function getUserActivityLogs(userId, options) {
  return request({
    url: `/admin/users/${userId}/logs/`,
    method: 'GET',
    ...options
  })
}

/**
 * 更新用户头像
 * @param {Number} userId - 用户ID
 * @param {FormData} data - 头像数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回更新结果
 */
export function updateUserAvatar(userId, data, options) {
  return request({
    url: `/admin/users/${userId}/avatar/`,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...options
  })
}

/**
 * 获取用户统计信息
 * @param {Number} userId - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回用户统计信息
 */
export function getUserStats(userId, options) {
  return request({
    url: `/admin/users/${userId}/stats/`,
    method: 'GET',
    ...options
  })
}
