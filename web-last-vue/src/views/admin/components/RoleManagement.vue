<template>
  <div class="role-management">
    <el-row :gutter="20">
      <!-- 角色列表 -->
      <el-col :span="8">
        <el-card shadow="never" class="role-card">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" :icon="Plus" size="small" @click="handleAddRole">添加角色</el-button>
            </div>
          </template>
          <el-input
            v-model="roleKeyword"
            placeholder="搜索角色"
            :prefix-icon="Search"
            clearable
            style="margin-bottom: 15px"
          />
          <el-scrollbar height="400px">
            <el-menu
              :default-active="activeRoleId.toString()"
              @select="handleRoleSelect"
            >
              <el-menu-item
                v-for="role in filteredRoles"
                :key="role.id"
                :index="role.id.toString()"
                class="role-item"
              >
                <div class="role-name">{{ role.name }}</div>
                <div class="role-action">
                  <el-button
                    type="primary"
                    link
                    :icon="Edit"
                    @click.stop="handleEditRole(role)"
                  />
                  <el-button
                    type="primary"
                    link
                    :icon="Delete"
                    @click.stop="handleDeleteRole(role)"
                  />
                </div>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 权限设置 -->
      <el-col :span="16">
        <el-card shadow="never" class="permission-card">
          <template #header>
            <div class="card-header">
              <span>权限设置 - {{ currentRole.name }}</span>
              <el-button
                type="primary"
                size="small"
                @click="handleSavePermissions"
                :disabled="!activeRoleId"
              >
                保存权限
              </el-button>
            </div>
          </template>
          <div v-if="activeRoleId" class="permission-content">
            <el-tree
              ref="permissionTree"
              :data="permissionData"
              :props="permissionProps"
              show-checkbox
              node-key="id"
              default-expand-all
            />
          </div>
          <div v-else class="empty-tip">
            请选择一个角色以设置权限
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogType === 'add' ? '添加角色' : '编辑角色'"
      width="500px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="roleForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 角色列表数据
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '系统超级管理员，拥有所有权限',
    status: true
  },
  {
    id: 2,
    name: '项目经理',
    code: 'manager',
    description: '项目管理人员，负责项目的创建和管理',
    status: true
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '普通用户，拥有基础功能权限',
    status: true
  }
])

// 搜索角色
const roleKeyword = ref('')
const filteredRoles = computed(() => {
  if (!roleKeyword.value) return roles.value
  
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(roleKeyword.value.toLowerCase()) ||
    role.code.toLowerCase().includes(roleKeyword.value.toLowerCase())
  )
})

// 当前选中的角色
const activeRoleId = ref('')
const currentRole = computed(() => {
  if (!activeRoleId.value) return {}
  return roles.value.find(role => role.id.toString() === activeRoleId.value) || {}
})

// 权限树数据
const permissionData = ref([
  {
    id: 1,
    label: '系统管理',
    children: [
      {
        id: 101,
        label: '用户管理',
        children: [
          { id: 10101, label: '查看用户' },
          { id: 10102, label: '创建用户' },
          { id: 10103, label: '编辑用户' },
          { id: 10104, label: '删除用户' }
        ]
      },
      {
        id: 102,
        label: '角色管理',
        children: [
          { id: 10201, label: '查看角色' },
          { id: 10202, label: '创建角色' },
          { id: 10203, label: '编辑角色' },
          { id: 10204, label: '删除角色' }
        ]
      },
      {
        id: 103,
        label: '菜单管理',
        children: [
          { id: 10301, label: '查看菜单' },
          { id: 10302, label: '创建菜单' },
          { id: 10303, label: '编辑菜单' },
          { id: 10304, label: '删除菜单' }
        ]
      }
    ]
  },
  {
    id: 2,
    label: '项目管理',
    children: [
      {
        id: 201,
        label: '项目列表',
        children: [
          { id: 20101, label: '查看项目' },
          { id: 20102, label: '创建项目' },
          { id: 20103, label: '编辑项目' },
          { id: 20104, label: '删除项目' }
        ]
      },
      {
        id: 202,
        label: '任务管理',
        children: [
          { id: 20201, label: '查看任务' },
          { id: 20202, label: '创建任务' },
          { id: 20203, label: '编辑任务' },
          { id: 20204, label: '删除任务' }
        ]
      }
    ]
  },
  {
    id: 3,
    label: '个人中心',
    children: [
      { id: 301, label: '个人信息' },
      { id: 302, label: '修改密码' }
    ]
  }
])

const permissionProps = {
  children: 'children',
  label: 'label'
}

const permissionTree = ref(null)

// 角色对话框
const roleDialogVisible = ref(false)
const roleDialogType = ref('add')
const roleFormRef = ref(null)
const roleForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  status: true
})

// 表单校验规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { 
      pattern: /^[a-z0-9_]+$/, 
      message: '角色编码只能包含小写字母、数字和下划线', 
      trigger: 'blur' 
    }
  ]
}

// 角色权限映射
const rolePermissions = {
  '1': [101, 102, 103, 10101, 10102, 10103, 10104, 10201, 10202, 10203, 10204, 10301, 10302, 10303, 10304, 201, 202, 20101, 20102, 20103, 20104, 20201, 20202, 20203, 20204, 301, 302],
  '2': [101, 10101, 201, 202, 20101, 20102, 20103, 20104, 20201, 20202, 20203, 20204, 301, 302],
  '3': [20101, 20201, 301, 302]
}

// 初始化
onMounted(() => {
  handleRoleSelect('1')
})

// 处理角色选择
const handleRoleSelect = (roleId) => {
  activeRoleId.value = roleId
  
  // 设置权限树的选中状态
  if (permissionTree.value) {
    permissionTree.value.setCheckedKeys([])
    const permissions = rolePermissions[roleId] || []
    permissionTree.value.setCheckedKeys(permissions)
  }
}

// 处理添加角色
const handleAddRole = () => {
  roleDialogType.value = 'add'
  roleForm.id = ''
  roleForm.name = ''
  roleForm.code = ''
  roleForm.description = ''
  roleForm.status = true
  roleDialogVisible.value = true
}

// 处理编辑角色
const handleEditRole = (role) => {
  roleDialogType.value = 'edit'
  roleForm.id = role.id
  roleForm.name = role.name
  roleForm.code = role.code
  roleForm.description = role.description
  roleForm.status = role.status
  roleDialogVisible.value = true
}

// 处理删除角色
const handleDeleteRole = async (role) => {
  if (role.code === 'admin') {
    ElMessage.warning('超级管理员角色不可删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 ${role.name} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API请求
    console.log('删除角色:', role)
    ElMessage.success('删除成功')
    
    // 如果删除的是当前选中的角色，则重置选中
    if (activeRoleId.value === role.id.toString()) {
      activeRoleId.value = ''
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 提交角色表单
const handleRoleSubmit = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    
    // 模拟API请求
    console.log('提交角色表单:', roleForm)
    ElMessage.success(roleDialogType.value === 'add' ? '添加成功' : '更新成功')
    roleDialogVisible.value = false
    
    // 如果是编辑当前选中的角色，则更新当前角色
    if (roleDialogType.value === 'edit' && roleForm.id.toString() === activeRoleId.value) {
      // 刷新角色数据
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 保存权限
const handleSavePermissions = () => {
  if (!permissionTree.value || !activeRoleId.value) return
  
  const checkedKeys = permissionTree.value.getCheckedKeys()
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
  const permissions = [...checkedKeys, ...halfCheckedKeys]
  
  // 模拟API请求
  console.log('保存权限:', {
    roleId: activeRoleId.value,
    permissions
  })
  
  // 更新本地存储的角色权限映射
  rolePermissions[activeRoleId.value] = permissions
  
  ElMessage.success('权限保存成功')
}
</script>

<style lang="scss" scoped>
.role-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .role-card {
    height: 530px;
    
    .role-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .role-name {
        flex: 1;
      }
      
      .role-action {
        display: none;
      }
      
      &:hover .role-action {
        display: flex;
        gap: 5px;
      }
    }
  }
  
  .permission-card {
    height: 530px;
    
    .permission-content {
      padding: 10px 0;
    }
    
    .empty-tip {
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
