<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <img src="/odm-logo.png" alt="logo" />
        <span v-show="!isCollapse">后台管理系统</span>
      </div>
      <el-menu
        :collapse="isCollapse"
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-sub-menu index="/project">
          <template #title>
            <el-icon><Folder /></el-icon>
            <span>项目管理</span>
          </template>
          <el-menu-item index="/project">项目列表</el-menu-item>
          <el-menu-item index="/project/task">任务列表</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/cesium">
          <el-icon><MapLocation /></el-icon>
          <template #title>三维地图</template>
        </el-menu-item>

        <el-menu-item index="/admin">
          <el-icon><Setting /></el-icon>
          <template #title>系统管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主容器 -->
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { 
  DataBoard, 
  Setting, 
  Fold, 
  Expand, 
  Folder, 
  MapLocation 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 当前路由名称
const currentRoute = computed(() => route.meta.title || '')

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    userStore.logout()
    router.push('/user/login')
  } else if (command === 'profile') {
    // 跳转到个人信息页面
    router.push('/profile')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  
  .aside {
    transition: width 0.3s;
    background-color: #304156;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      background: #2b3649;
      
      img {
        width: 32px;
        height: 32px;
      }
      
      span {
        margin-left: 12px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }
    
    .el-menu {
      border-right: none;
      
      &-vertical:not(.el-menu--collapse) {
        width: 200px;
      }
    }
  }
  
  .header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .collapse-btn {
        padding: 0 12px;
        cursor: pointer;
        font-size: 20px;
        color: #303133;
        
        &:hover {
          color: var(--el-color-primary);
        }
      }
      
      .el-breadcrumb {
        margin-left: 16px;
      }
    }
    
    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        .username {
          margin-left: 8px;
          font-size: 14px;
        }
      }
    }
  }
  
  .main {
    background-color: #f0f2f5;
    padding: 16px;
    
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
  }
}
</style>
