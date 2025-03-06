<template>
  <div class="user-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加用户</el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户"
        style="width: 200px"
        class="ml-2"
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
        clearable
      />
    </div>

    <!-- 用户表格 -->
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag
            :type="row.role === 'admin' ? 'danger' : row.role === 'manager' ? 'warning' : 'info'"
          >
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="true"
            :inactive-value="false"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Key" @click="handleResetPassword(row)">
            重置密码
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
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

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="true"
            :inactive-value="false"
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

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPwdDialogVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwdForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResetPwdSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Edit, Delete, Key } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    role: 'admin',
    email: 'admin@example.com',
    createTime: '2024-01-01 00:00:00',
    status: true
  },
  {
    id: 2,
    username: 'manager',
    name: '项目经理',
    role: 'manager',
    email: 'manager@example.com',
    createTime: '2024-01-02 10:30:00',
    status: true
  },
  {
    id: 3,
    username: 'user1',
    name: '普通用户1',
    role: 'user',
    email: 'user1@example.com',
    createTime: '2024-01-03 14:20:00',
    status: false
  }
])

// 搜索
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  username: '',
  name: '',
  role: '',
  email: '',
  password: '',
  status: true
})

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

// 重置密码对话框
const resetPwdDialogVisible = ref(false)
const resetPwdFormRef = ref(null)
const currentUserId = ref(null)
const resetPwdForm = reactive({
  password: '',
  confirmPassword: ''
})

// 重置密码校验规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetPwdForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const resetPwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 获取角色文本
const getRoleText = (role) => {
  const map = {
    admin: '管理员',
    manager: '经理',
    user: '普通用户'
  }
  return map[role] || role
}

// 加载数据
const loadData = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

onMounted(() => {
  loadData()
})

// 处理搜索
const handleSearch = () => {
  console.log('搜索关键词：', searchKeyword.value)
  loadData()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.username = ''
  form.name = ''
  form.role = ''
  form.email = ''
  form.password = ''
  form.status = true
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.username = row.username
  form.name = row.name
  form.role = row.role
  form.email = row.email
  form.status = row.status
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API请求
    console.log('删除用户:', row)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消操作
  }
}

// 处理状态变更
const handleStatusChange = (row) => {
  const status = row.status ? '启用' : '禁用'
  console.log(`${status}用户:`, row)
  ElMessage.success(`已${status}用户 ${row.username}`)
}

// 处理重置密码
const handleResetPassword = (row) => {
  currentUserId.value = row.id
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdDialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 模拟API请求
    console.log('提交表单:', form)
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 提交重置密码
const handleResetPwdSubmit = async () => {
  if (!resetPwdFormRef.value) return
  
  try {
    await resetPwdFormRef.value.validate()
    
    // 模拟API请求
    console.log('重置密码:', {
      userId: currentUserId.value,
      password: resetPwdForm.password
    })
    ElMessage.success('密码重置成功')
    resetPwdDialogVisible.value = false
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}
</script>

<style lang="scss" scoped>
.user-management {
  .toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .ml-2 {
    margin-left: 8px;
  }
}
</style>
