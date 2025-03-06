import { defineStore } from 'pinia'
import { login as apiLogin, getCurrentUser } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token'),
    mockMode: localStorage.getItem('mockMode') === 'true' // 是否使用模拟数据模式
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username
  },

  actions: {
    async login(uname, pwd) {
      try {
        // 检查后端服务是否可用
        if (this.mockMode) {
          // 使用模拟数据
          console.log('使用模拟数据登录')
          if (uname === 'admin' && pwd === 'admin') {
            const mockToken = 'mock-token-' + Date.now()
            this.token = mockToken
            localStorage.setItem('token', mockToken)
            this.userInfo = {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              role: 'admin'
            }
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo)) // 保存用户信息到本地存储
            console.log('模拟登录成功，用户信息：', this.userInfo)
            ElMessage.success('登录成功（模拟模式）')
            return true
          } else {
            ElMessage.error('用户名或密码错误')
            return false
          }
        }
        
        // 正常登录流程
        const { token } = await apiLogin({ uname, pwd })
        this.token = token
        localStorage.setItem('token', token)
        await this.getUserInfo()
        ElMessage.success('登录成功')
        return true
      } catch (error) {
        console.error('Login failed:', error)
        
        // 检查是否是连接错误
        if (error.message && error.message.includes('Network Error')) {
          ElMessage.error('无法连接到服务器，请检查后端服务是否运行')
          
          // 提示用户可以切换到模拟模式
          if (confirm('是否切换到模拟数据模式？（用户名: admin, 密码: admin）')) {
            this.mockMode = true
            localStorage.setItem('mockMode', 'true')
            return this.login(uname, pwd)
          }
        } else {
          ElMessage.error('登录失败: ' + (error.response?.data?.message || error.message || '未知错误'))
        }
        
        return false
      }
    },

    async getUserInfo() {
      try {
        if (this.mockMode) {
          // 使用模拟数据
          this.userInfo = {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
          }
          return this.userInfo
        }
        
        const data = await getCurrentUser()
        this.userInfo = data
        return data
      } catch (error) {
        console.error('Get user info failed:', error)
        
        // 如果获取用户信息失败，并且是网络错误或404错误，自动切换到模拟模式
        if (error.response?.status === 404 || (error.message && error.message.includes('Network Error'))) {
          console.log('后端API不可用，自动切换到模拟模式')
          this.mockMode = true
          localStorage.setItem('mockMode', 'true')
          
          // 使用模拟数据
          this.userInfo = {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
          }
          
          return this.userInfo
        }
        
        return null
      }
    },

    logout() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo') // 移除用户信息
      // 保留mockMode设置
      ElMessage.success('已退出登录')
    },
    
    // 切换模拟数据模式
    toggleMockMode() {
      this.mockMode = !this.mockMode
      localStorage.setItem('mockMode', this.mockMode ? 'true' : 'false')
      ElMessage.info(this.mockMode ? '已切换到模拟数据模式' : '已切换到正常模式')
    },
    
    // 初始化状态
    async init() {
      // 从localStorage读取mockMode设置
      this.mockMode = localStorage.getItem('mockMode') === 'true'
      
      // 如果有token，尝试获取用户信息
      if (this.token) {
        this.userInfo = JSON.parse(localStorage.getItem('userInfo')) // 从本地存储读取用户信息
        await this.getUserInfo()
      }
      
      // 如果不是模拟模式，检查后端是否可用
      if (!this.mockMode) {
        this.checkBackendAvailability()
      }
    },
    
    // 检查后端是否可用
    async checkBackendAvailability() {
      try {
        // 尝试访问后端API
        const response = await fetch('/api/health-check', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3000) // 3秒超时
        })
        
        // 只有当响应状态为200时才认为后端可用
        if (response.ok) {
          console.log('后端服务可用')
          return true
        } else {
          throw new Error(`服务器返回错误状态码: ${response.status}`)
        }
      } catch (error) {
        console.error('后端服务不可用:', error)
        
        // 如果后端不可用，自动切换到模拟模式
        if (!this.mockMode) {
          console.log('自动切换到模拟模式')
          this.mockMode = true
          localStorage.setItem('mockMode', 'true')
          ElMessage.warning('后端服务不可用，已自动切换到模拟数据模式')
        }
        return false
      }
    }
  }
})
