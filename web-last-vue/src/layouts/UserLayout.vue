<template>
  <div class="user-layout">
    <div class="content">
      <div class="top">
        <div class="header">
          <img src="/odm-logo.png" class="logo" alt="logo" />
          <span class="title">后台管理系统</span>
        </div>
        <div class="desc">基于Vue3 + Element Plus的管理系统</div>
      </div>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
// UserLayout
</script>

<style scoped lang="scss">
.user-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: auto;
  background: #f0f2f5;

  .content {
    flex: 1;
    padding: 32px 0;
    
    .top {
      text-align: center;
      
      .header {
        height: 44px;
        line-height: 44px;
        
        .logo {
          height: 44px;
          vertical-align: top;
          margin-right: 16px;
        }
        
        .title {
          position: relative;
          top: 2px;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 600;
          font-size: 33px;
        }
      }
      
      .desc {
        margin-top: 12px;
        margin-bottom: 40px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
