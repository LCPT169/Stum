<template>
  <div class="project-detail">
    <el-card shadow="hover">
      <template #header>
        <div class="detail-header">
          <span>{{ project.name }}</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleEdit">编辑项目</el-button>
            <el-button type="success" @click="viewInCesium">在Cesium中查看</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border title="项目详情" v-loading="loading">
        <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getProjectStatusType(project.status)">{{ getStatusText(project.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="进度">
          <el-progress :percentage="project.progress || 0" :status="getProgressStatus(project.progress)"></el-progress>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(project.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(project.updated_at) }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ project.creator?.name || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ project.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 项目统计信息 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ projectStats.taskCount || 0 }}</div>
          <div class="stat-label">总任务数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ projectStats.completedTaskCount || 0 }}</div>
          <div class="stat-label">已完成任务</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ projectStats.fileCount || 0 }}</div>
          <div class="stat-label">文件数量</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="task-header">
          <span>任务列表</span>
          <div class="task-actions">
            <el-input
              v-model="taskSearchKeyword"
              placeholder="搜索任务"
              style="width: 200px; margin-right: 10px;"
              clearable
              @clear="handleTaskSearch"
              @input="handleTaskSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="goToTaskCreate">新建任务</el-button>
          </div>
        </div>
      </template>
      <el-table :data="filteredTasks" style="width: 100%;" v-loading="loading">
        <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
        <el-table-column prop="name" label="任务名称">
          <template #default="{ row }">
            <router-link :to="`/project/task/detail/${row.id}`">{{ row.name }}</router-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusType(row.status)">{{ getTaskStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :status="getProgressStatus(row.progress)"></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewTaskDetail(row.id)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDeleteTask(row.id)">删除</el-button>
            <el-button size="small" type="warning" v-if="row.status !== 'completed'" @click="handleRestartTask(row.id)">重启</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="tasks.length > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="tasks.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectApi, taskApi } from '@/api'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id
const loading = ref(false)

const project = ref({})
const tasks = ref([])
const projectStats = ref({})

// 分页和搜索
const currentPage = ref(1)
const pageSize = ref(10)
const taskSearchKeyword = ref('')

// 根据关键字过滤并分页任务列表
const filteredTasks = computed(() => {
  const keyword = taskSearchKeyword.value.toLowerCase()
  const filtered = keyword
    ? tasks.value.filter(task => 
        task.name.toLowerCase().includes(keyword) || 
        (task.description && task.description.toLowerCase().includes(keyword))
      )
    : tasks.value
  
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

const getStatusText = (status) => {
  const map = {
    pending: '未开始',
    processing: '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getTaskStatusText = (status) => {
  const map = {
    pending: '未开始',
    processing: '进行中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

const getTaskStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getProjectStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'primary',
    completed: 'success'
  }
  return map[status] || 'info'
}

const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 80) return 'warning'
  return ''
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleEdit = () => {
  router.push({ path: `/project/edit/${projectId}` })
}

const viewInCesium = () => {
  router.push({ path: `/cesium?projectId=${projectId}` })
}

const goToTaskCreate = () => {
  router.push({ path: `/project/${projectId}/task/create` })
}

const viewTaskDetail = (taskId) => {
  router.push({ path: `/project/task/detail/${taskId}` })
}

const handleTaskSearch = () => {
  currentPage.value = 1 // 重置到第一页
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const fetchProjectDetail = async () => {
  loading.value = true
  try {
    const { data } = await projectApi.getProjectDetails(projectId)
    project.value = data
  } catch (error) {
    console.error('获取项目详情失败:', error)
    ElMessage.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
}

const fetchProjectStats = async () => {
  try {
    const { data } = await projectApi.getProjectStats(projectId)
    projectStats.value = data
  } catch (error) {
    console.error('获取项目统计信息失败:', error)
  }
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const { data } = await taskApi.getTasksByProject(projectId)
    tasks.value = data
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const handleDeleteTask = (taskId) => {
  ElMessageBox.confirm('确定要删除此任务吗？此操作不可逆', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await taskApi.deleteTask(projectId, taskId)
      ElMessage.success('删除任务成功')
      fetchTasks() // 刷新任务列表
      fetchProjectStats() // 刷新项目统计
    } catch (error) {
      console.error('删除任务失败:', error)
      ElMessage.error('删除任务失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handleRestartTask = async (taskId) => {
  try {
    await taskApi.restartTask(projectId, taskId)
    ElMessage.success('重启任务成功')
    fetchTasks() // 刷新任务列表
  } catch (error) {
    console.error('重启任务失败:', error)
    ElMessage.error('重启任务失败')
  }
}

onMounted(() => {
  fetchProjectDetail()
  fetchTasks()
  fetchProjectStats()
})
</script>

<style scoped lang="scss">
.project-detail {
  padding: 20px;
  
  .detail-header, .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-actions, .task-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .stat-card {
    text-align: center;
    padding: 20px;
    
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #409EFF;
      margin-bottom: 10px;
    }
    
    .stat-label {
      font-size: 16px;
      color: #606266;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
