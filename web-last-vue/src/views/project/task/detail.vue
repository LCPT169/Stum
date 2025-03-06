<template>
  <div class="task-detail-container">
    <el-page-header @back="goBack" :title="'返回任务列表'">
      <template #content>
        <span class="page-title">任务详情</span>
      </template>
    </el-page-header>

    <div v-loading="loading" class="content-wrapper">
      <!-- 任务基本信息 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-button type="primary" @click="handleEdit">编辑任务</el-button>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{ taskDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="所属项目">{{ taskDetail.project_name || taskDetail.projectName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(taskDetail.status)">{{ getStatusText(taskDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="taskDetail.progress || 0"></el-progress>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ formatDate(taskDetail.start_date || taskDetail.startDate) }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ formatDate(taskDetail.end_date || taskDetail.endDate) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(taskDetail.created_at || taskDetail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ taskDetail.creator || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">
            {{ taskDetail.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 任务进度 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>进度更新</span>
            <el-button type="primary" @click="handleUpdateProgress">更新进度</el-button>
          </div>
        </template>
        
        <div class="progress-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in progressActivities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
              :color="activity.color"
            >
              <div class="timeline-content">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.content }}</p>
                <div v-if="activity.progress !== undefined" class="progress-info">
                  <span>进度更新: {{ activity.progress }}%</span>
                  <el-progress :percentage="activity.progress" :status="activity.progressStatus"></el-progress>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <!-- 相关文件 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>相关文件</span>
            <el-upload
              action="#"
              :http-request="uploadFile"
              :show-file-list="false"
              :before-upload="beforeFileUpload"
            >
              <el-button type="primary">上传文件</el-button>
            </el-upload>
          </div>
        </template>
        
        <el-table :data="fileList" style="width: 100%" v-loading="fileLoading">
          <el-table-column prop="name" label="文件名"></el-table-column>
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="upload_time" label="上传时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.upload_time || row.uploadTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="uploader" label="上传人" width="120"></el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="downloadFile(row)">下载</el-button>
              <el-button type="danger" link @click="deleteFile(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 更新进度对话框 -->
    <el-dialog v-model="progressDialogVisible" title="更新任务进度" width="500px">
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="当前进度">
          <el-slider v-model="progressForm.progress" :step="5"></el-slider>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="progressForm.status" placeholder="请选择状态">
            <el-option label="未开始" value="pending"></el-option>
            <el-option label="进行中" value="processing"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="canceled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="progressForm.remark"
            type="textarea"
            rows="4"
            placeholder="请输入进度更新备注"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="progressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProgressUpdate" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskApi, projectApi } from '@/api'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id
const projectId = route.params.projectId || route.query.projectId

// 加载状态
const loading = ref(true)
const fileLoading = ref(false)
const submitting = ref(false)

// 任务详情
const taskDetail = ref({
  id: taskId,
  name: '',
  projectId: projectId,
  projectName: '',
  status: 'pending',
  progress: 0,
  description: '',
  startDate: '',
  endDate: '',
  createTime: '',
  creator: ''
})

// 进度更新记录
const progressActivities = ref([])

// 文件列表
const fileList = ref([])

// 进度更新对话框
const progressDialogVisible = ref(false)
const progressForm = reactive({
  progress: 0,
  status: 'pending',
  remark: ''
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    pending: '未开始',
    processing: '进行中',
    completed: '已完成',
    canceled: '已取消'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    canceled: 'danger'
  }
  return map[status] || 'info'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 返回任务列表
const goBack = () => {
  router.push(`/project/detail/${projectId}`)
}

// 编辑任务
const handleEdit = () => {
  router.push(`/project/task/edit/${taskId}?projectId=${projectId}`)
}

// 加载任务详情
const loadTaskDetail = async () => {
  loading.value = true
  try {
    const response = await taskApi.getTaskDetail(projectId, taskId)
    taskDetail.value = response
    
    // 初始化进度表单
    progressForm.progress = response.progress || 0
    progressForm.status = response.status || 'pending'
    
    // 加载进度历史
    await loadProgressHistory()
    
    // 加载任务文件
    await loadTaskFiles()
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

// 加载进度历史
const loadProgressHistory = async () => {
  try {
    const history = await taskApi.getTaskProgressHistory(projectId, taskId)
    
    if (history && history.length > 0) {
      progressActivities.value = history.map(item => {
        return {
          timestamp: formatDateTime(item.created_at),
          title: item.title || '进度更新',
          content: item.remark || '更新了任务进度',
          type: 'primary',
          color: '#0bbd87',
          progress: item.progress,
          progressStatus: item.status === 'completed' ? 'success' : ''
        }
      })
    } else {
      // 如果没有历史记录，添加一条任务创建记录
      progressActivities.value = [{
        timestamp: formatDateTime(taskDetail.value.created_at || taskDetail.value.createTime),
        title: '任务创建',
        content: '任务已创建，等待开始。',
        type: 'primary',
        color: '#0bbd87'
      }]
    }
  } catch (error) {
    console.error('获取进度历史失败:', error)
    ElMessage.error('获取进度历史失败')
  }
}

// 加载任务文件
const loadTaskFiles = async () => {
  fileLoading.value = true
  try {
    const files = await taskApi.getTaskFiles(projectId, taskId)
    fileList.value = files || []
  } catch (error) {
    console.error('获取任务文件失败:', error)
    ElMessage.error('获取任务文件失败')
  } finally {
    fileLoading.value = false
  }
}

// 更新进度
const handleUpdateProgress = () => {
  progressForm.progress = taskDetail.value.progress || 0
  progressForm.status = taskDetail.value.status || 'pending'
  progressForm.remark = ''
  progressDialogVisible.value = true
}

// 提交进度更新
const submitProgressUpdate = async () => {
  submitting.value = true
  try {
    await taskApi.updateTaskProgress(projectId, taskId, {
      progress: progressForm.progress,
      status: progressForm.status,
      remark: progressForm.remark
    })
    
    // 更新任务详情
    taskDetail.value.progress = progressForm.progress
    taskDetail.value.status = progressForm.status
    
    // 添加进度更新记录
    const now = new Date().toLocaleString()
    const newActivity = {
      timestamp: now,
      title: '进度更新',
      content: progressForm.remark || '更新了任务进度',
      type: 'primary',
      color: '#0bbd87',
      progress: progressForm.progress,
      progressStatus: progressForm.status === 'completed' ? 'success' : ''
    }
    
    progressActivities.value.unshift(newActivity)
    
    ElMessage.success('进度更新成功')
    progressDialogVisible.value = false
  } catch (error) {
    console.error('更新进度失败:', error)
    ElMessage.error('更新进度失败')
  } finally {
    submitting.value = false
  }
}

// 上传文件前检查
const beforeFileUpload = (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20
  
  if (!isLt20M) {
    ElMessage.error('上传文件大小不能超过 20MB!')
  }
  
  return isLt20M
}

// 上传文件
const uploadFile = async (options) => {
  const { file } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const result = await taskApi.uploadTaskFile(projectId, taskId, formData)
    
    if (result) {
      // 重新加载文件列表
      await loadTaskFiles()
      ElMessage.success('文件上传成功')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败')
  }
}

// 下载文件
const downloadFile = async (file) => {
  try {
    const response = await taskApi.downloadTaskFile(projectId, taskId, file.id)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success(`文件下载成功: ${file.name}`)
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败')
  }
}

// 删除文件
const deleteFile = (file) => {
  ElMessageBox.confirm(
    `确定要删除文件 "${file.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await taskApi.deleteTaskFile(projectId, taskId, file.id)
      // 更新文件列表
      fileList.value = fileList.value.filter(item => item.id !== file.id)
      ElMessage.success('文件删除成功')
    } catch (error) {
      console.error('文件删除失败:', error)
      ElMessage.error('文件删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  if (!projectId) {
    ElMessage.error('缺少项目ID参数')
    router.push('/project/list')
    return
  }
  
  // 加载任务详情
  loadTaskDetail()
})
</script>

<style lang="scss" scoped>
.task-detail-container {
  padding: 20px;
  
  .page-title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .content-wrapper {
    margin-top: 20px;
  }
  
  .detail-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .progress-timeline {
    padding: 10px;
    
    .timeline-content {
      h4 {
        margin: 0 0 10px 0;
      }
      
      p {
        margin: 5px 0;
        color: #606266;
      }
      
      .progress-info {
        margin-top: 10px;
        
        span {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
