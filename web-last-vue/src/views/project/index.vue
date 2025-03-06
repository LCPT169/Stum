<template>
  <div class="project-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入项目名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮和表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新建项目
          </el-button>
          <el-button type="danger" :icon="Delete" :disabled="!selectedRows.length" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                link
                :icon="View"
                @click="handleView(row)"
              >
                查看
              </el-button>
              <el-button
                type="primary"
                link
                :icon="Edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="primary"
                link
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 项目表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建项目' : '编辑项目'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目进度" prop="progress">
          <el-slider v-model="form.progress" :step="10" show-stops />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  View,
  Edit
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectApi } from '@/api'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    name: '城市建筑群测绘',
    status: 'completed',
    progress: 100,
    createTime: '2024-03-01 10:00:00'
  },
  {
    id: 2,
    name: '森林覆盖率调查',
    status: 'processing',
    progress: 45,
    createTime: '2024-03-02 14:30:00'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 选择行
const selectedRows = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  name: '',
  status: 'pending',
  progress: 0,
  description: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    pending: '未开始',
    processing: '进行中',
    completed: '已完成'
  }
  return map[status]
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 调用搜索API
}

// 处理重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 处理表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.name = ''
  form.status = 'pending'
  form.progress = 0
  form.description = ''
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 处理查看
const handleView = (row) => {
  console.log('查看项目：', row)
  // TODO: 跳转到项目详情页
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该项目吗？', '提示', {
      type: 'warning'
    })
    console.log('删除项目：', row)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedRows.value.length} 个项目吗？`,
      '提示',
      {
        type: 'warning'
      }
    )
    console.log('批量删除项目：', selectedRows.value)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    console.log('提交表单：', form)
    ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
    dialogVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

const loadProjectData = async () => {
  loading.value = true
  try {
    const response = await projectApi.getProjects()
    tableData.value = response.data
  } catch (error) {
    console.error('获取项目数据失败，使用模拟数据: ', error)
    // 使用模拟数据
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProjectData()
})
</script>

<style lang="scss" scoped>
.project-container {
  padding: 20px;
  
  .search-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
