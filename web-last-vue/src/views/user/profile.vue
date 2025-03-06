<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="8" :md="6" :lg="5">
        <el-card class="profile-card">
          <div class="user-info">
            <el-avatar :size="100" :src="userInfo.avatar" />
            <h3 class="username">{{ userInfo.name }}</h3>
            <p class="user-role">{{ getRoleText(userInfo.role) }}</p>
          </div>
          <el-divider />
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>{{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <el-icon><Message /></el-icon>
            <span>{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <el-icon><Phone /></el-icon>
            <span>{{ userInfo.phone || '未设置' }}</span>
          </div>
          <div class="info-item">
            <el-icon><Calendar /></el-icon>
            <span>{{ userInfo.joinTime || '未知' }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="16" :md="18" :lg="19">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" @click="handleSave" :loading="loading">保存更改</el-button>
            </div>
          </template>
          
          <el-form 
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
          >
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本信息" name="basic">
                <el-form-item label="头像">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :http-request="uploadAvatar"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                  >
                    <img v-if="form.avatar" :src="form.avatar" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
                <el-form-item label="用户名">
                  <el-input v-model="form.username" disabled />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="form.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input
                    v-model="form.bio"
                    type="textarea"
                    rows="4"
                    placeholder="请输入个人简介"
                  />
                </el-form-item>
              </el-tab-pane>
              
              <el-tab-pane label="修改密码" name="password">
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input
                    v-model="form.oldPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="form.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="form.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>
              </el-tab-pane>
              
              <el-tab-pane label="通知设置" name="notification">
                <el-form-item label="邮件通知">
                  <el-switch v-model="form.emailNotification" />
                </el-form-item>
                <el-form-item label="系统消息">
                  <el-switch v-model="form.systemNotification" />
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { User, Message, Phone, Calendar, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(false)
const activeTab = ref('basic')

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 表单
const formRef = ref(null)
const form = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
  role: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  emailNotification: true,
  systemNotification: true
})

// 表单校验
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
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

// 初始化表单数据
const initFormData = () => {
  form.username = userInfo.value.username || ''
  form.name = userInfo.value.name || ''
  form.email = userInfo.value.email || ''
  form.phone = userInfo.value.phone || ''
  form.avatar = userInfo.value.avatar || ''
  form.bio = userInfo.value.bio || ''
  form.role = userInfo.value.role || ''
}

onMounted(() => {
  initFormData()
})

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
  }
  
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过2MB!')
  }
  
  return isImage && isLt2M
}

// 处理头像上传
const uploadAvatar = (options) => {
  const { file } = options
  
  // 这里模拟上传，实际项目中应该调用上传API
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (e) => {
    form.avatar = e.target.result
    ElMessage.success('头像上传成功')
  }
}

// 保存表单
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 根据当前标签页进行不同的保存操作
    if (activeTab.value === 'password') {
      // 修改密码
      console.log('修改密码:', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      })
      
      // 清空密码字段
      form.oldPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
      
      ElMessage.success('密码修改成功')
    } else {
      // 保存个人信息
      console.log('保存个人信息:', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        avatar: form.avatar,
        bio: form.bio,
        emailNotification: form.emailNotification,
        systemNotification: form.systemNotification
      })
      
      // 更新用户信息
      // userStore.updateUserInfo({...form})
      
      ElMessage.success('个人信息保存成功')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  
  .profile-card {
    .user-info {
      text-align: center;
      padding: 20px 0;
      
      .username {
        margin: 10px 0 5px;
        font-size: 18px;
      }
      
      .user-role {
        color: #909399;
        font-size: 14px;
        margin: 0;
      }
    }
    
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #909399;
      }
      
      span {
        color: #606266;
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .avatar-uploader {
    width: 100px;
    height: 100px;
    border: 1px dashed var(--el-border-color);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    
    &:hover {
      border-color: var(--el-color-primary);
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      display: block;
      object-fit: cover;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
