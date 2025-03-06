<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <img src="/404.svg" alt="404" class="not-found-image" />
      <h1 class="not-found-title">404</h1>
      <h2 class="not-found-subtitle">抱歉，您访问的页面不存在</h2>
      <p class="not-found-desc">
        可能是链接错误或者该页面已被删除
      </p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
      <el-button @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  
  .not-found-content {
    text-align: center;
    padding: 40px;
    
    .not-found-image {
      width: 300px;
      max-width: 100%;
      margin-bottom: 20px;
    }
    
    .not-found-title {
      font-size: 72px;
      color: #409eff;
      margin: 0;
    }
    
    .not-found-subtitle {
      font-size: 24px;
      color: #303133;
      margin: 10px 0;
    }
    
    .not-found-desc {
      font-size: 16px;
      color: #606266;
      margin-bottom: 30px;
    }
    
    .el-button {
      margin: 0 10px;
    }
  }
}
</style>
