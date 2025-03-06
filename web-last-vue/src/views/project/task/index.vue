<template>
  <div class="task-list-container">
    <el-card shadow="hover">
      <template #header>
        <div class="task-header">
          <span>{{ pageTitle }}</span>
          <el-button v-if="!isEdit" type="primary" @click="handleAddTask">新建任务</el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form v-if="!isEdit" :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.name" placeholder="请输入任务名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未开始" value="pending"></el-option>
            <el-option label="进行中" value="processing"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="canceled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 任务表格 -->
      <el-table
        v-if="!isEdit"
        v-loading="loading"
        :data="pagedTaskList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
        <el-table-column prop="name" label="任务名称"></el-table-column>
        <el-table-column prop="projectName" label="所属项目"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress"></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewTask(row)">查看</el-button>
            <el-button type="primary" link @click="handleEditTask(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 任务表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建任务' : '编辑任务'"
      width="600px"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskRules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="taskForm.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option
              v-for="item in projectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入任务描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="taskForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="taskForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="taskForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" value="pending"></el-option>
            <el-option label="进行中" value="processing"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="canceled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="进度" prop="progress">
          <el-slider v-model="taskForm.progress" :step="5"></el-slider>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTaskForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 判断是否为编辑模式
const isEdit = computed(() => route.props?.isEdit || false)
const taskId = computed(() => route.params.id || null)

// 页面标题
const pageTitle = computed(() => isEdit.value ? '编辑任务' : '任务列表')

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 任务列表
const taskList = ref([
  {
    id: 1,
    name: '数据采集任务',
    projectId: 1,
    projectName: '森林覆盖率调查项目',
    status: 'completed',
    progress: 100,
    createTime: '2024-03-01 10:00:00',
    description: '采集项目区域的卫星影像数据',
    startDate: '2024-03-01',
    endDate: '2024-03-05'
  },
  {
    id: 2,
    name: '数据处理任务',
    projectId: 1,
    projectName: '森林覆盖率调查项目',
    status: 'processing',
    progress: 60,
    createTime: '2024-03-05 14:30:00',
    description: '对采集的数据进行预处理和分析',
    startDate: '2024-03-05',
    endDate: '2024-03-10'
  },
  {
    id: 3,
    name: '结果分析任务',
    projectId: 1,
    projectName: '森林覆盖率调查项目',
    status: 'pending',
    progress: 0,
    createTime: '2024-03-05 15:00:00',
    description: '分析处理结果，生成报告',
    startDate: '2024-03-10',
    endDate: '2024-03-15'
  },
  {
    id: 4,
    name: '数据采集任务',
    projectId: 2,
    projectName: '城市绿化监测项目',
    status: 'processing',
    progress: 45,
    createTime: '2024-03-03 09:00:00',
    description: '采集城市区域的卫星影像数据',
    startDate: '2024-03-03',
    endDate: '2024-03-08'
  }
])

// 分页后的任务列表
const pagedTaskList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return taskList.value.slice(start, end)
})

// 项目选项
const projectOptions = ref([
  { value: 1, label: '森林覆盖率调查项目' },
  { value: 2, label: '城市绿化监测项目' },
  { value: 3, label: '农田监测项目' }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const taskFormRef = ref(null)
const taskForm = reactive({
  id: '',
  name: '',
  projectId: '',
  status: 'pending',
  progress: 0,
  description: '',
  startDate: '',
  endDate: ''
})

// 表单校验规则
const taskRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择任务状态', trigger: 'change' }
  ]
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

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTaskList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

// 获取任务列表
const fetchTaskList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 这里应该是调用真实的API
    let filteredList = [...taskList.value]
    
    // 根据搜索条件过滤
    if (searchForm.name) {
      filteredList = filteredList.filter(item => 
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    if (searchForm.status) {
      filteredList = filteredList.filter(item => 
        item.status === searchForm.status
      )
    }
    
    total.value = filteredList.length
    
    // 模拟分页
    taskList.value = filteredList
    
    loading.value = false
  }, 500)
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
}

// 新建任务
const handleAddTask = () => {
  dialogType.value = 'add'
  resetTaskForm()
  dialogVisible.value = true
}

// 编辑任务
const handleEditTask = (row) => {
  dialogType.value = 'edit'
  Object.assign(taskForm, row)
  dialogVisible.value = true
}

// 查看任务
const handleViewTask = (row) => {
  router.push(`/project/task/detail/${row.id}`)
}

// 删除任务
const handleDeleteTask = (row) => {
  ElMessageBox.confirm(
    `确定要删除任务 "${row.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      // 这里应该是调用真实的API
      taskList.value = taskList.value.filter(item => item.id !== row.id)
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    // 取消删除
  })
}

// 重置任务表单
const resetTaskForm = () => {
  taskForm.id = ''
  taskForm.name = ''
  taskForm.projectId = ''
  taskForm.status = 'pending'
  taskForm.progress = 0
  taskForm.description = ''
  taskForm.startDate = ''
  taskForm.endDate = ''
}

// 提交任务表单
const submitTaskForm = async () => {
  if (!taskFormRef.value) return
  
  try {
    await taskFormRef.value.validate()
    
    if (dialogType.value === 'add') {
      // 模拟添加任务
      const newTask = {
        ...taskForm,
        id: Math.floor(Math.random() * 1000) + 5,
        createTime: new Date().toLocaleString(),
        projectName: projectOptions.value.find(item => item.value === taskForm.projectId)?.label || ''
      }
      
      taskList.value.unshift(newTask)
      ElMessage.success('添加成功')
    } else {
      // 模拟更新任务
      const index = taskList.value.findIndex(item => item.id === taskForm.id)
      if (index !== -1) {
        taskList.value[index] = {
          ...taskList.value[index],
          ...taskForm,
          projectName: projectOptions.value.find(item => item.value === taskForm.projectId)?.label || ''
        }
        ElMessage.success('更新成功')
      }
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

onMounted(() => {
  fetchTaskList()
})
</script>

<style lang="scss" scoped>
.task-list-container {
  padding: 20px;
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-form {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
