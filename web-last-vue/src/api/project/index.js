/**
 * 项目相关API
 */
import request from '@/utils/request/axios'

/**
 * 获取项目列表
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目列表
 */
export function getProjects(options) {
  return request({
    url: '/api/api/project/getall',
    method: 'POST',
    data: { uid: localStorage.getItem('uid') || '1' },
    ...options
  })
}

/**
 * 获取项目详情
 * @param {String} pid - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目详情
 */
export function getProjectDetails(pid, options) {
  return request({
    url: '/api/api/project/get',
    method: 'POST',
    data: { pid },
    ...options
  })
}

/**
 * 创建项目
 * @param {Object} data - 项目数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回创建结果
 */
export function createProject(data, options) {
  return request({
    url: '/api/api/project/add',
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 更新项目
 * @param {Object} data - 项目数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回更新结果
 */
export function updateProject(data, options) {
  return request({
    url: '/api/api/project/update',
    method: 'POST',
    data,
    ...options
  })
}

/**
 * 删除项目
 * @param {String} id - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回删除结果
 */
export function deleteProject(id, options) {
  return request({
    url: '/api/api/project/delete',
    method: 'POST',
    data: { id },
    ...options
  })
}

/**
 * 获取项目统计数据
 * @param {String} id - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目统计数据
 */
export function getProjectStats(id, options) {
  return request({
    url: '/api/api/project/stats',
    method: 'POST',
    data: { id },
    ...options
  })
}

/**
 * 获取项目文件列表
 * @param {Number} id - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目文件列表
 */
export function getProjectFiles(id, options) {
  return request({
    url: `/api/api/project/files`,
    method: 'POST',
    data: { pid: id },
    ...options
  })
}

/**
 * 上传项目文件
 * @param {Number} id - 项目ID
 * @param {FormData} data - 文件数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回上传结果
 */
export function uploadProjectFile(id, data, options) {
  return request({
    url: `/api/api/project/files/upload`,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...options
  })
}

/**
 * 删除项目文件
 * @param {Number} projectId - 项目ID
 * @param {Number} fileId - 文件ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回删除结果
 */
export function deleteProjectFile(projectId, fileId, options) {
  return request({
    url: `/api/api/project/files/delete`,
    method: 'POST',
    data: { pid: projectId, fid: fileId },
    ...options
  })
}

/**
 * 下载项目文件
 * @param {Number} projectId - 项目ID
 * @param {Number} fileId - 文件ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回文件下载链接
 */
export function downloadProjectFile(projectId, fileId, options) {
  return request({
    url: `/api/api/project/files/download`,
    method: 'POST',
    data: { pid: projectId, fid: fileId },
    responseType: 'blob',
    ...options
  })
}

/**
 * 获取项目成员列表
 * @param {Number} id - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回项目成员列表
 */
export function getProjectMembers(id, options) {
  return request({
    url: `/api/api/project/members`,
    method: 'POST',
    data: { pid: id },
    ...options
  })
}

/**
 * 添加项目成员
 * @param {Number} id - 项目ID
 * @param {Object} data - 成员信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回添加结果
 */
export function addProjectMember(id, data, options) {
  return request({
    url: `/api/api/project/members/add`,
    method: 'POST',
    data: { pid: id, ...data },
    ...options
  })
}

/**
 * 移除项目成员
 * @param {Number} projectId - 项目ID
 * @param {Number} userId - 用户ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回移除结果
 */
export function removeProjectMember(projectId, userId, options) {
  return request({
    url: `/api/api/project/members/remove`,
    method: 'POST',
    data: { pid: projectId, uid: userId },
    ...options
  })
}

/**
 * 更新项目进度
 * @param {Number} id - 项目ID
 * @param {Object} data - 进度信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回更新结果
 */
export function updateProjectProgress(id, data, options) {
  return request({
    url: `/api/api/project/progress`,
    method: 'POST',
    data: { pid: id, ...data },
    ...options
  })
}
