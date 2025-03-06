<template>
  <div class="cesium-container">
    <div id="cesiumContainer" class="cesium-viewer"></div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" :icon="ZoomIn" @click="zoomIn" title="放大"></el-button>
        <el-button type="primary" :icon="ZoomOut" @click="zoomOut" title="缩小"></el-button>
        <el-button type="primary" :icon="Location" @click="resetView" title="重置视图"></el-button>
      </el-button-group>
      
      <el-button-group style="margin-left: 10px;">
        <el-button type="primary" :icon="Menu" @click="layerDialogVisible = true" title="图层管理"></el-button>
        <el-button type="primary" :icon="Compass" @click="toggleCompass" title="指南针"></el-button>
        <el-button type="primary" :icon="Aim" @click="toggleMeasurement" title="测量工具"></el-button>
      </el-button-group>
    </div>
    
    <!-- 图层面板 -->
    <el-drawer
      v-model="layerDialogVisible"
      title="图层管理"
      direction="rtl"
      size="300px"
    >
      <el-tree
        :data="layerTree"
        show-checkbox
        node-key="id"
        default-expand-all
        @check="handleLayerCheck"
      />
    </el-drawer>
    
    <!-- 项目信息面板 -->
    <div v-if="selectedProject" class="info-panel">
      <div class="panel-header">
        <span>项目信息</span>
        <el-icon @click="closeInfoPanel"><Close /></el-icon>
      </div>
      <div class="panel-content">
        <h3>{{ selectedProject.name }}</h3>
        <p><strong>位置：</strong>{{ selectedProject.location || '未知' }}</p>
        <p><strong>创建时间：</strong>{{ formatDateTime(selectedProject.created_at) }}</p>
        <p><strong>描述：</strong>{{ selectedProject.description || '暂无描述' }}</p>
        
        <el-divider />
        
        <h4>树冠检测结果</h4>
        <el-row :gutter="10">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ selectedProject.stats?.treeCount || 0 }}</div>
              <div class="stat-label">树木数量</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ selectedProject.stats?.avgHeight || 0 }}m</div>
              <div class="stat-label">平均高度</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ selectedProject.stats?.coverage || 0 }}%</div>
              <div class="stat-label">覆盖率</div>
            </div>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <el-button type="primary" @click="viewProjectDetail">查看详情</el-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>正在加载...</span>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-overlay">
      <el-icon class="error-icon"><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ZoomIn, 
  ZoomOut, 
  Location, 
  Menu, 
  Compass, 
  Aim, 
  Close,
  Loading,
  Warning
} from '@element-plus/icons-vue'
import * as Cesium from 'cesium'
import { initCesium, loadImageryLayers, loadTerrainProvider } from '@/utils/cesium'
import { projectApi } from '@/api'
import { cesiumApi } from '@/api'

const router = useRouter()

// Cesium 实例
const viewer = ref(null)

// 加载状态
const loading = ref(true)
const error = ref(null)

// 图层对话框
const layerDialogVisible = ref(false)

// 图层树
const layerTree = ref([
  {
    id: 'basemap',
    label: '底图',
    children: [
      { id: 'osm', label: 'OpenStreetMap', checked: true },
      { id: 'bing', label: 'Bing 卫星影像', checked: false },
      { id: 'arcgis', label: 'ArcGIS 影像', checked: false }
    ]
  },
  {
    id: 'terrain',
    label: '地形',
    children: [
      { id: 'cesium_world', label: 'Cesium World Terrain', checked: true },
      { id: 'ellipsoid', label: '椭球体', checked: false }
    ]
  },
  {
    id: 'data',
    label: '数据图层',
    children: [
      { id: 'trees', label: '树冠检测结果', checked: true },
      { id: 'buildings', label: '建筑物', checked: false },
      { id: 'roads', label: '道路', checked: false }
    ]
  }
])

// 选中的项目
const selectedProject = ref(null)

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化 Cesium
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    // 确保DOM已经渲染
    await nextTick()
    
    // 初始化Cesium
    const cesiumViewer = initCesium('cesiumContainer')
    if (!cesiumViewer) {
      throw new Error('Cesium Viewer初始化失败')
    }
    
    viewer.value = cesiumViewer
    
    // 加载图层
    await loadImageryLayers(cesiumViewer)
    
    // 加载项目数据
    await loadProjectData(cesiumViewer)
    
    loading.value = false
  } catch (err) {
    console.error('初始化Cesium失败:', err)
    error.value = err.message || '初始化Cesium失败'
    loading.value = false
    ElMessage.error('初始化Cesium失败: ' + (err.message || '未知错误'))
  }
})

// 销毁 Cesium
onUnmounted(() => {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
})

// 加载默认图层
const loadDefaultLayers = () => {
  // 加载影像图层
  loadImageryLayers(viewer.value)
  
  // 加载地形
  loadTerrainProvider(viewer.value)
}

// 加载项目数据
const loadProjectData = async (cesiumViewer) => {
  try {
    // 从API获取项目数据
    const response = await projectApi.getProjects().catch(error => {
      console.error('获取项目数据失败，使用模拟数据:', error)
      // 使用模拟数据
      return { 
        data: [
          {
            id: 1,
            name: '项目A',
            description: '这是项目A的描述',
            location: '北京市',
            status: '进行中',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            progress: 75,
            manager: '张三',
            budget: 1000000
          },
          {
            id: 2,
            name: '项目B',
            description: '这是项目B的描述',
            location: '上海市',
            status: '已完成',
            startDate: '2022-06-01',
            endDate: '2023-06-30',
            progress: 100,
            manager: '李四',
            budget: 2000000
          },
          {
            id: 3,
            name: '项目C',
            description: '这是项目C的描述',
            location: '深圳市',
            status: '计划中',
            startDate: '2023-07-01',
            endDate: '2024-07-31',
            progress: 0,
            manager: '王五',
            budget: 3000000
          }
        ]
      }
    })
    
    const projects = response.data || []
    
    if (projects && projects.length > 0) {
      // 默认选中第一个项目
      const projectId = projects[0].id
      
      // 尝试获取项目详情，如果失败则使用项目列表中的数据
      let projectDetail
      try {
        const detailResponse = await projectApi.getProjectDetails(projectId)
        projectDetail = detailResponse.data
      } catch (error) {
        console.error('获取项目详情失败，使用项目列表数据:', error)
        projectDetail = projects[0]
      }
      
      selectedProject.value = {
        ...projectDetail,
        startDate: formatDateTime(projectDetail.startDate),
        endDate: formatDateTime(projectDetail.endDate)
      }
      
      // 在地图上添加项目标记
      projects.forEach(project => {
        // 为每个项目创建一个随机位置（如果没有位置数据）
        const longitude = 116.4 + (Math.random() - 0.5) * 10
        const latitude = 39.9 + (Math.random() - 0.5) * 10
        
        addProjectMarker({
          id: project.id,
          name: project.name,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100)
        })
      })
    } else {
      ElMessage.warning('没有可用的项目数据')
    }
  } catch (error) {
    console.error('获取项目数据失败:', error)
    ElMessage.error('获取项目数据失败')
  }
}

// 在地图上添加项目标记
const addProjectMarker = (project) => {
  viewer.value.entities.add({
    id: `project-${project.id}`,
    position: project.position,
    billboard: {
      image: '/odm-logo.png',
      width: 32,
      height: 32
    },
    label: {
      text: project.name,
      font: '14px sans-serif',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -36)
    }
  })
}

// 放大
const zoomIn = () => {
  if (viewer.value) {
    viewer.value.camera.zoomIn(viewer.value.camera.positionCartographic.height * 0.2)
  }
}

// 缩小
const zoomOut = () => {
  if (viewer.value) {
    viewer.value.camera.zoomOut(viewer.value.camera.positionCartographic.height * 0.2)
  }
}

// 重置视图
const resetView = () => {
  if (viewer.value) {
    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(120.12, 30.26, 10000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    })
  }
}

// 处理图层选择
const handleLayerCheck = (data, checked) => {
  console.log('图层选择:', data, checked)
  // 根据选择的图层更新地图显示
}

// 切换指南针
const toggleCompass = () => {
  if (viewer.value) {
    viewer.value.scene.debugShowFramesPerSecond = !viewer.value.scene.debugShowFramesPerSecond
  }
}

// 切换测量工具
const toggleMeasurement = () => {
  // 实现测量功能
  console.log('切换测量工具')
}

// 关闭信息面板
const closeInfoPanel = () => {
  selectedProject.value = null
}

// 查看项目详情
const viewProjectDetail = () => {
  if (selectedProject.value) {
    router.push(`/project/detail/${selectedProject.value.id}`)
  }
}
</script>

<style lang="scss" scoped>
.cesium-container {
  position: relative;
  width: 100%;
  height: 100%;
  
  .cesium-viewer {
    width: 100%;
    height: 100%;
  }
  
  .toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .info-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 300px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #ebeef5;
      
      span {
        font-weight: bold;
      }
      
      .el-icon {
        cursor: pointer;
        
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
    
    .panel-content {
      padding: 15px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 15px;
      }
      
      p {
        margin: 8px 0;
      }
      
      .stat-item {
        text-align: center;
        padding: 10px 0;
        
        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: var(--el-color-primary);
        }
        
        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    
    .loading-icon {
      font-size: 24px;
      margin-right: 10px;
    }
  }
  
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    
    .error-icon {
      font-size: 24px;
      margin-right: 10px;
      color: var(--el-color-danger);
    }
  }
}
</style>
