<template>
  <div class="admin-container">
    <el-tabs v-model="activeTab" class="admin-tabs">
      <el-tab-pane label="用户管理" name="user">
        <user-management v-if="activeTab === 'user'" />
      </el-tab-pane>
      <el-tab-pane label="角色权限" name="role">
        <role-management v-if="activeTab === 'role'" />
      </el-tab-pane>
      <el-tab-pane label="系统设置" name="setting">
        <system-setting v-if="activeTab === 'setting'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserManagement from './components/UserManagement.vue'
import RoleManagement from './components/RoleManagement.vue'
import SystemSetting from './components/SystemSetting.vue'

const activeTab = ref('user')
</script>

<style lang="scss" scoped>
.admin-container {
  padding: 20px;
  
  .admin-tabs {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
}
</style>
