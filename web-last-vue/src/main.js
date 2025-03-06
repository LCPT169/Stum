import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import './styles/global.scss'

// 初始化Cesium
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 设置Cesium资源路径
window.CESIUM_BASE_URL = import.meta.env.BASE_URL + 'node_modules/cesium/Build/Cesium'

// 初始化Cesium访问令牌
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzJkYjE1Ny05YjZiLTQ4NWUtYmI3NC01ODMxZjAxMzZhN2YiLCJpZCI6MjI2NTg2LCJpYXQiOjE3MjAxNjMxMzB9.hvxOXOwEmWjbVYlxVAnDCNZjHzAKQ74SgZAKNmXE1Qc'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化用户状态
import { useUserStore } from './store/user'
const userStore = useUserStore(pinia)
userStore.init()

app.mount('#app')
