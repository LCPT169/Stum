<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :span="6" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <span class="card-title">{{ card.title }}</span>
            <el-icon :size="24" :class="card.iconClass">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-footer">
            <span>{{ card.footer }}</span>
            <span :class="card.trend > 0 ? 'up' : 'down'" v-if="card.trend !== 0">
              {{ Math.abs(card.trend) }}%
              <el-icon>
                <component :is="card.trend > 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>项目统计</span>
              <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="projectChartRef">
            <div v-if="loading" class="chart-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>最近活动</span>
            </div>
          </template>
          <div v-if="activitiesLoading" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <el-empty v-else-if="activities.length === 0" description="暂无活动" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务统计 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>任务状态分布</span>
            </div>
          </template>
          <div class="chart-container" ref="taskStatusChartRef">
            <div v-if="loading" class="chart-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>存储使用情况</span>
            </div>
          </template>
          <div class="chart-container" ref="storageChartRef">
            <div v-if="loading" class="chart-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { dashboardApi } from '@/api'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 模拟数据
const mockData = {
  stats: {
    projects: {
      total: 12,
      new: 3,
      growth: 25
    },
    tasks: {
      total: 48,
      completed: 36,
      pending: 12
    },
    storage: {
      total: 1024, // GB
      used: 512,   // GB
      free: 512    // GB
    },
    users: {
      total: 8,
      active: 5
    }
  },
  activities: [
    { id: 1, user: '管理员', action: '创建了项目', target: '森林调查项目', time: '2025-03-05 10:30:00' },
    { id: 2, user: '张三', action: '完成了任务', target: '图像处理', time: '2025-03-05 09:15:00' },
    { id: 3, user: '李四', action: '上传了文件', target: '航拍图像.zip', time: '2025-03-04 16:45:00' },
    { id: 4, user: '王五', action: '添加了评论', target: '任务报告', time: '2025-03-04 14:20:00' },
    { id: 5, user: '管理员', action: '更新了系统设置', target: '存储配置', time: '2025-03-03 11:10:00' }
  ],
  projectTrends: {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '新建项目',
        data: [3, 5, 2, 7, 4, 6]
      },
      {
        label: '完成项目',
        data: [2, 3, 1, 5, 3, 4]
      }
    ]
  },
  taskStats: {
    total: 48,
    completed: 36,
    processing: 8,
    failed: 4
  },
  storageStats: {
    total: 1024,
    used: {
      images: 256,
      models: 128,
      reports: 64,
      other: 64
    }
  }
}

// 数据概览卡片数据
const cards = ref([
  {
    title: '总项目数',
    value: '0',
    footer: '总计项目数',
    trend: 0,
    icon: 'Folder',
    iconClass: 'project-icon'
  },
  {
    title: '本月新增',
    value: '0',
    footer: '较上月增长',
    trend: 0,
    icon: 'Plus',
    iconClass: 'new-icon'
  },
  {
    title: '处理中项目',
    value: '0',
    footer: '正在处理',
    trend: 0,
    icon: 'Loading',
    iconClass: 'processing-icon'
  },
  {
    title: '完成项目',
    value: '0',
    footer: '已完成项目',
    trend: 0,
    icon: 'Check',
    iconClass: 'completed-icon'
  }
])

// 图表时间范围
const timeRange = ref('month')

// 最近活动数据
const activities = ref([])

// 加载状态
const loading = ref(false)
const activitiesLoading = ref(false)
const projectChartLoading = ref(false)
const taskChartLoading = ref(false)
const storageChartLoading = ref(false)

// 时间范围选择
const timeRangeOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' }
]

// 图表引用
const projectChartRef = ref(null)
const taskStatusChartRef = ref(null)
const storageChartRef = ref(null)

// 图表实例
let projectChart = null
let taskStatusChart = null
let storageChart = null

// 获取仪表盘统计数据
const fetchDashboardStats = async () => {
  try {
    loading.value = true
    const data = await dashboardApi.getDashboardStats()
    // 更新卡片数据
    cards.value[0].value = data.projects.total
    cards.value[0].trend = data.projects.growth
    cards.value[1].value = data.projects.new
    cards.value[2].value = data.tasks.total
    cards.value[2].trend = data.tasks.completed / data.tasks.total * 100
    cards.value[3].value = `${Math.round(data.storage.used / 1024)}GB`
    cards.value[3].trend = data.storage.used / data.storage.total * 100
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error)
    // 使用模拟数据
    cards.value[0].value = mockData.stats.projects.total.toString()
    cards.value[0].trend = mockData.stats.projects.growth
    cards.value[1].value = mockData.stats.projects.new.toString()
    cards.value[2].value = mockData.stats.tasks.total.toString()
    cards.value[2].trend = mockData.stats.tasks.completed / mockData.stats.tasks.total * 100
    cards.value[3].value = `${Math.round(mockData.stats.storage.used / 1024)}GB`
    cards.value[3].trend = mockData.stats.storage.used / mockData.stats.storage.total * 100
    
    ElMessage.warning('使用模拟数据展示仪表盘（后端API未实现）')
  } finally {
    loading.value = false
  }
}

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    activitiesLoading.value = true
    const data = await dashboardApi.getRecentActivities()
    activities.value = data
  } catch (error) {
    console.error('获取最近活动失败:', error)
    // 使用模拟数据
    activities.value = mockData.activities
  } finally {
    activitiesLoading.value = false
  }
}

// 获取项目趋势数据
const fetchProjectTrends = async () => {
  try {
    projectChartLoading.value = true
    const data = await dashboardApi.getProjectTrends(timeRange.value)
    initProjectChart(data)
  } catch (error) {
    console.error('获取项目趋势数据失败:', error)
    // 使用模拟数据
    initProjectChart(mockData.projectTrends)
  } finally {
    projectChartLoading.value = false
  }
}

// 获取任务统计数据
const fetchTaskStats = async () => {
  try {
    taskChartLoading.value = true
    const data = await dashboardApi.getTaskStats()
    initTaskStatusChart(data)
  } catch (error) {
    console.error('获取任务统计数据失败:', error)
    // 使用模拟数据
    initTaskStatusChart(mockData.taskStats)
  } finally {
    taskChartLoading.value = false
  }
}

// 获取存储统计数据
const fetchStorageStats = async () => {
  try {
    storageChartLoading.value = true
    const data = await dashboardApi.getStorageStats()
    initStorageChart(data)
  } catch (error) {
    console.error('获取存储统计数据失败:', error)
    // 使用模拟数据
    initStorageChart(mockData.storageStats)
  } finally {
    storageChartLoading.value = false
  }
}

// 初始化项目趋势图表
const initProjectChart = (data) => {
  if (!projectChartRef.value) return
  
  // 如果图表已存在，销毁它
  if (projectChart) {
    projectChart.dispose()
  }
  
  // 创建新图表
  projectChart = echarts.init(projectChartRef.value)
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新建项目', '完成项目']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.labels || []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新建项目',
        type: 'line',
        data: data.datasets[0].data || [],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#67c23a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      },
      {
        name: '完成项目',
        type: 'line',
        data: data.datasets[1].data || [],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  // 设置图表选项
  projectChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    projectChart && projectChart.resize()
  })
}

// 初始化任务状态图表
const initTaskStatusChart = (data) => {
  if (!taskStatusChartRef.value) return
  
  // 如果图表已存在，销毁它
  if (taskStatusChart) {
    taskStatusChart.dispose()
  }
  
  // 创建新图表
  taskStatusChart = echarts.init(taskStatusChartRef.value)
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['已完成', '处理中', '待处理']
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: data.completed, name: '已完成' },
          { value: data.processing, name: '处理中' },
          { value: data.total - data.completed - data.processing, name: '待处理' }
        ]
      }
    ]
  }
  
  // 设置图表选项
  taskStatusChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    taskStatusChart && taskStatusChart.resize()
  })
}

// 初始化存储使用图表
const initStorageChart = (data) => {
  if (!storageChartRef.value) return
  
  // 如果图表已存在，销毁它
  if (storageChart) {
    storageChart.dispose()
  }
  
  // 创建新图表
  storageChart = echarts.init(storageChartRef.value)
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['图像', '模型', '报告', '其他']
    },
    series: [
      {
        name: '存储使用',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: data.used.images, name: '图像' },
          { value: data.used.models, name: '模型' },
          { value: data.used.reports, name: '报告' },
          { value: data.used.other, name: '其他' }
        ]
      }
    ]
  }
  
  // 设置图表选项
  storageChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    storageChart && storageChart.resize()
  })
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  fetchProjectTrends()
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取活动类型
const getActivityType = (type) => {
  const typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'danger',
    default: 'primary'
  }
  return typeMap[type] || 'primary'
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchDashboardStats()
  await fetchRecentActivities()
  
  // 等待DOM更新后初始化图表
  nextTick(async () => {
    await fetchProjectTrends()
    await fetchTaskStats()
    await fetchStorageStats()
  })
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .dashboard-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .card-title {
        font-size: 16px;
        color: #909399;
      }
    }
    
    .card-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #909399;
      font-size: 14px;
      
      .up {
        color: #67c23a;
      }
      
      .down {
        color: #f56c6c;
      }
    }
  }
  
  .project-icon {
    color: #409EFF;
  }
  
  .new-icon {
    color: #67c23a;
  }
  
  .processing-icon {
    color: #e6a23c;
  }
  
  .completed-icon {
    color: #67c23a;
  }
  
  .card-header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .chart-container {
    height: 350px;
    position: relative;
  }
  
  .chart-loading, .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #909399;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
  }
}
</style>
