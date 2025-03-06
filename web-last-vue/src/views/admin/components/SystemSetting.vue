<template>
  <div class="system-setting">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本设置" name="basic">
        <el-card shadow="never">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="uploadLogo"
                :show-file-list="false"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="basicForm.logo" :src="basicForm.logo" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">推荐尺寸: 192x192像素, 文件大小不超过2MB</div>
            </el-form-item>
            <el-form-item label="系统描述" prop="description">
              <el-input
                v-model="basicForm.description"
                type="textarea"
                rows="4"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            <el-form-item label="备案信息" prop="icp">
              <el-input v-model="basicForm.icp" placeholder="请输入备案信息" />
            </el-form-item>
            <el-form-item label="版权信息" prop="copyright">
              <el-input v-model="basicForm.copyright" placeholder="请输入版权信息" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="邮件设置" name="mail">
        <el-card shadow="never">
          <el-form
            ref="mailFormRef"
            :model="mailForm"
            :rules="mailRules"
            label-width="120px"
          >
            <el-form-item label="SMTP服务器" prop="smtpServer">
              <el-input v-model="mailForm.smtpServer" placeholder="请输入SMTP服务器地址" />
            </el-form-item>
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number v-model="mailForm.smtpPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="发件人邮箱" prop="senderEmail">
              <el-input v-model="mailForm.senderEmail" placeholder="请输入发件人邮箱" />
            </el-form-item>
            <el-form-item label="邮箱密码/授权码" prop="password">
              <el-input
                v-model="mailForm.password"
                type="password"
                placeholder="请输入邮箱密码或授权码"
                show-password
              />
            </el-form-item>
            <el-form-item label="SSL加密">
              <el-switch v-model="mailForm.ssl" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveMailSettings">保存设置</el-button>
              <el-button @click="testMailConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="安全设置" name="security">
        <el-card shadow="never">
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            label-width="180px"
          >
            <el-form-item label="密码最小长度" prop="passwordMinLength">
              <el-input-number
                v-model="securityForm.passwordMinLength"
                :min="6"
                :max="20"
              />
            </el-form-item>
            <el-form-item label="密码复杂度要求">
              <el-checkbox-group v-model="securityForm.passwordComplexity">
                <el-checkbox label="lowercase">包含小写字母</el-checkbox>
                <el-checkbox label="uppercase">包含大写字母</el-checkbox>
                <el-checkbox label="numbers">包含数字</el-checkbox>
                <el-checkbox label="special">包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="securityForm.loginLockEnabled" />
            </el-form-item>
            <el-form-item label="失败尝试次数" v-if="securityForm.loginLockEnabled">
              <el-input-number
                v-model="securityForm.loginMaxAttempts"
                :min="3"
                :max="10"
              />
            </el-form-item>
            <el-form-item label="锁定时间(分钟)" v-if="securityForm.loginLockEnabled">
              <el-input-number
                v-model="securityForm.loginLockTime"
                :min="5"
                :max="1440"
              />
            </el-form-item>
            <el-form-item label="会话超时时间(分钟)" prop="sessionTimeout">
              <el-input-number
                v-model="securityForm.sessionTimeout"
                :min="5"
                :max="1440"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 当前活动标签页
const activeTab = ref('basic')

// 基本设置表单
const basicFormRef = ref(null)
const basicForm = reactive({
  systemName: '后台管理系统',
  logo: '/odm-logo.png',
  description: '基于Vue3和Element Plus的后台管理系统',
  icp: '浙ICP备XXXXXXXX号',
  copyright: '© 2025 Company Name. All rights reserved.'
})

const basicRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入系统描述', trigger: 'blur' }
  ]
}

// 邮件设置表单
const mailFormRef = ref(null)
const mailForm = reactive({
  smtpServer: 'smtp.example.com',
  smtpPort: 465,
  senderEmail: 'admin@example.com',
  password: '',
  ssl: true
})

const mailRules = {
  smtpServer: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' }
  ],
  senderEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码或授权码', trigger: 'blur' }
  ]
}

// 安全设置表单
const securityFormRef = ref(null)
const securityForm = reactive({
  passwordMinLength: 8,
  passwordComplexity: ['lowercase', 'numbers'],
  loginLockEnabled: true,
  loginMaxAttempts: 5,
  loginLockTime: 30,
  sessionTimeout: 120
})

// Logo上传前的验证
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传Logo只能是图片格式!')
  }
  
  if (!isLt2M) {
    ElMessage.error('上传Logo大小不能超过2MB!')
  }
  
  return isImage && isLt2M
}

// 处理Logo上传
const uploadLogo = (options) => {
  const { file } = options
  
  // 这里模拟上传，实际项目中应该调用上传API
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (e) => {
    basicForm.logo = e.target.result
    ElMessage.success('Logo上传成功')
  }
}

// 保存基本设置
const saveBasicSettings = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    
    // 模拟API请求
    console.log('保存基本设置:', basicForm)
    ElMessage.success('基本设置保存成功')
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 保存邮件设置
const saveMailSettings = async () => {
  if (!mailFormRef.value) return
  
  try {
    await mailFormRef.value.validate()
    
    // 模拟API请求
    console.log('保存邮件设置:', mailForm)
    ElMessage.success('邮件设置保存成功')
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 测试邮件连接
const testMailConnection = async () => {
  if (!mailFormRef.value) return
  
  try {
    await mailFormRef.value.validate()
    
    // 模拟API请求
    console.log('测试邮件连接:', mailForm)
    ElMessage.success('连接测试成功')
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 保存安全设置
const saveSecuritySettings = () => {
  // 模拟API请求
  console.log('保存安全设置:', securityForm)
  ElMessage.success('安全设置保存成功')
}
</script>

<style lang="scss" scoped>
.system-setting {
  .avatar-uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    
    &:hover {
      border-color: var(--el-color-primary);
    }
    
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  .upload-tip {
    font-size: 12px;
    color: #606266;
    margin-top: 8px;
  }
}
</style>
