<template>
  <div class="login-container">
    <el-form
      ref="formRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">用户登录</h3>
      </div>

      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="用户名"
          type="text"
          tabindex="1"
          :prefix-icon="User"
          autocomplete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="密码"
          :type="passwordVisible ? 'text' : 'password'"
          tabindex="2"
          :prefix-icon="Lock"
          autocomplete="on"
        >
          <template #suffix>
            <el-icon 
              class="cursor-pointer"
              @click="passwordVisible = !passwordVisible"
            >
              <component :is="passwordVisible ? 'View' : 'Hide'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="useMockMode" label="模拟模式" />
        <el-tooltip content="模拟模式下，使用 admin/admin 登录" placement="top">
          <el-icon><InfoFilled /></el-icon>
        </el-tooltip>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click="handleLogin"
      >
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, Lock, View, Hide, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElTooltip } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const passwordVisible = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
}

const useMockMode = ref(false)

// 在组件挂载时检查后端是否可用
onMounted(async () => {
  try {
    // 尝试访问后端API
    const response = await fetch('/api/health-check', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000) // 3秒超时
    })
    
    if (response.ok) {
      console.log('后端服务可用')
      // 如果后端可用，使用正常模式
      useMockMode.value = false
    } else {
      throw new Error(`服务器返回错误状态码: ${response.status}`)
    }
  } catch (error) {
    console.error('后端服务不可用:', error)
    // 如果后端不可用，自动勾选模拟模式
    useMockMode.value = true
    ElMessage.warning('后端服务不可用，已自动切换到模拟数据模式')
  }
})

// 监听模拟模式变化
watch(useMockMode, (newValue) => {
  localStorage.setItem('mockMode', newValue ? 'true' : 'false')
})

const handleLogin = async () => {
  try {
    loading.value = true
    await formRef.value.validate()
    
    // 设置模拟模式
    userStore.mockMode = useMockMode.value
    
    // 如果使用模拟模式，并且用户名密码符合模拟模式要求，直接提示
    if (useMockMode.value) {
      ElMessage.info('使用模拟模式登录')
      if (loginForm.username !== 'admin' || loginForm.password !== 'admin') {
        ElMessage.warning('模拟模式下，请使用 admin/admin 登录')
        loading.value = false
        return
      }
    }
    
    const success = await userStore.login(loginForm.username, loginForm.password)
    if (success) {
      ElMessage.success('登录成功')
      // 添加延迟确保状态更新后再跳转
      setTimeout(() => {
        router.push('/')
      }, 300)
    } else {
      ElMessage.error('登录失败：用户名或密码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    width: 400px;
    max-width: 100%;
    padding: 35px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .title-container {
      position: relative;
      text-align: center;

      .title {
        font-size: 26px;
        margin: 0 auto 40px auto;
        font-weight: bold;
        color: #303133;
      }
    }
  }
}
</style>
