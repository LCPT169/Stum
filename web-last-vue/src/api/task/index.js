/**
 * 任务相关API
 */
import request from '@/utils/request/axios'

/**
 * 获取项目下的任务列表
 * @param {Number} projectId - 项目ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务列表
 */
export function getTasksByProject(projectId, options) {
  return request({
    url: `/api/api/task/getbyproject`,
    method: 'POST',
    data: { pid: projectId },
    ...options
  })
}

/**
 * 获取任务详情
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务详情
 */
export function getTaskDetail(projectId, taskId, options) {
  return request({
    url: `/api/api/task/get`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 创建任务
 * @param {Number} projectId - 项目ID
 * @param {Object} data - 任务信息和文件
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回创建结果
 */
export function createTask(projectId, data, options) {
  return request({
    url: `/api/api/task/add`,
    method: 'POST',
    data: { pid: projectId, ...data },
    ...options
  })
}

/**
 * 取消任务
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回取消结果
 */
export function cancelTask(projectId, taskId, options) {
  return request({
    url: `/api/api/task/cancel`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 删除任务
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回删除结果
 */
export function deleteTask(projectId, taskId, options) {
  return request({
    url: `/api/api/task/delete`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 重启任务
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回重启结果
 */
export function restartTask(projectId, taskId, options) {
  return request({
    url: `/api/api/task/restart`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 下载正射影像
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回下载链接
 */
export function downloadOrthophoto(taskId, options) {
  return request({
    url: `/api/api/task/download/orthophoto`,
    method: 'POST',
    data: { tid: taskId },
    ...options
  })
}

/**
 * 下载点云数据
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回下载链接
 */
export function downloadPointCloud(taskId, options) {
  return request({
    url: `/api/api/task/download/pointcloud`,
    method: 'POST',
    data: { tid: taskId },
    ...options
  })
}

/**
 * 获取任务进度历史
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回进度历史
 */
export function getTaskProgressHistory(projectId, taskId, options) {
  return request({
    url: `/api/api/task/progress/history`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 更新任务进度
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} data - 进度信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回更新结果
 */
export function updateTaskProgress(projectId, taskId, data, options) {
  return request({
    url: `/api/api/task/progress/update`,
    method: 'POST',
    data: { pid: projectId, tid: taskId, ...data },
    ...options
  })
}

/**
 * 获取任务相关文件
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回文件列表
 */
export function getTaskFiles(projectId, taskId, options) {
  return request({
    url: `/api/api/task/files`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 上传任务相关文件
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {FormData} formData - 包含文件的表单数据
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回上传结果
 */
export function uploadTaskFile(projectId, taskId, formData, options) {
  return request({
    url: `/api/api/task/files/upload`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...options
  })
}

/**
 * 删除任务相关文件
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Number} fileId - 文件ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回删除结果
 */
export function deleteTaskFile(projectId, taskId, fileId, options) {
  return request({
    url: `/api/api/task/files/delete`,
    method: 'POST',
    data: { pid: projectId, tid: taskId, fid: fileId },
    ...options
  })
}

/**
 * 下载任务相关文件
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Number} fileId - 文件ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回文件下载链接
 */
export function downloadTaskFile(projectId, taskId, fileId, options) {
  return request({
    url: `/api/api/task/files/download`,
    method: 'POST',
    data: { pid: projectId, tid: taskId, fid: fileId },
    responseType: 'blob',
    ...options
  })
}

/**
 * 搜索任务
 * @param {Number} projectId - 项目ID
 * @param {Object} params - 搜索参数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回搜索结果
 */
export function searchTasks(projectId, params, options) {
  return request({
    url: `/api/api/task/search`,
    method: 'POST',
    data: { pid: projectId, ...params },
    ...options
  })
}

/**
 * 获取任务统计信息
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务统计信息
 */
export function getTaskStats(projectId, taskId, options) {
  return request({
    url: `/api/api/task/stats`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 获取任务日志
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务日志
 */
export function getTaskLogs(projectId, taskId, options) {
  return request({
    url: `/api/api/task/logs`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 分配任务给用户
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} data - 用户信息
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回分配结果
 */
export function assignTaskToUser(projectId, taskId, data, options) {
  return request({
    url: `/api/api/task/assign`,
    method: 'POST',
    data: { pid: projectId, tid: taskId, ...data },
    ...options
  })
}

/**
 * 获取任务评论
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务评论
 */
export function getTaskComments(projectId, taskId, options) {
  return request({
    url: `/api/api/task/comments`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}

/**
 * 添加任务评论
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} data - 评论内容
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回添加结果
 */
export function addTaskComment(projectId, taskId, data, options) {
  return request({
    url: `/api/api/task/comments/add`,
    method: 'POST',
    data: { pid: projectId, tid: taskId, ...data },
    ...options
  })
}

/**
 * 删除任务评论
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Number} commentId - 评论ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回删除结果
 */
export function deleteTaskComment(projectId, taskId, commentId, options) {
  return request({
    url: `/api/api/task/comments/delete`,
    method: 'POST',
    data: { pid: projectId, tid: taskId, cid: commentId },
    ...options
  })
}

/**
 * 获取任务处理结果
 * @param {Number} projectId - 项目ID
 * @param {String} taskId - 任务ID
 * @param {Object} options - 请求选项
 * @returns {Promise} - 返回任务处理结果
 */
export function getTaskResults(projectId, taskId, options) {
  return request({
    url: `/api/api/task/results`,
    method: 'POST',
    data: { pid: projectId, tid: taskId },
    ...options
  })
}
