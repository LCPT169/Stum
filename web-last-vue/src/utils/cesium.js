import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as turf from '@turf/turf'

// 初始化 Cesium 访问令牌
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzJkYjE1Ny05YjZiLTQ4NWUtYmI3NC01ODMxZjAxMzZhN2YiLCJpZCI6MjI2NTg2LCJpYXQiOjE3MjAxNjMxMzB9.hvxOXOwEmWjbVYlxVAnDCNZjHzAKQ74SgZAKNmXE1Qc'

/**
 * 初始化 Cesium 地图
 * @param {string} containerId - 容器ID
 * @returns {Cesium.Viewer} - Cesium Viewer 实例
 */
export function initCesium(containerId) {
  try {
    console.log('初始化Cesium...')
    
    if (!containerId) {
      console.error('未提供容器ID')
      return null
    }
    
    if (!Cesium) {
      console.error('Cesium未加载')
      return null
    }
    
    let terrainProvider;
    try {
      // 尝试使用新版API
      if (Cesium.Terrain && Cesium.Terrain.fromWorldTerrain) {
        terrainProvider = Cesium.Terrain.fromWorldTerrain();
      } 
      // 尝试使用旧版API
      else if (Cesium.createWorldTerrain) {
        terrainProvider = Cesium.createWorldTerrain();
      }
      // 使用基本地形提供者
      else {
        terrainProvider = new Cesium.CesiumTerrainProvider({
          url: Cesium.IonResource.fromAssetId(1)
        });
      }
    } catch (e) {
      console.warn('创建地形提供者失败，使用默认地形', e);
      terrainProvider = undefined;
    }
    
    const container = document.getElementById(containerId)
    if (!container) {
      console.error(`找不到ID为 ${containerId} 的DOM元素`)
      return null
    }
    
    // 创建 Cesium Viewer
    const viewer = new Cesium.Viewer(containerId, {
      animation: false, // 动画小部件
      baseLayerPicker: false, // 底图选择器
      fullscreenButton: true, // 全屏按钮
      vrButton: false, // VR按钮
      geocoder: false, // 地理编码搜索框
      homeButton: true, // 主页按钮
      infoBox: true, // 信息框
      sceneModePicker: false, // 场景模式选择器
      selectionIndicator: true, // 选择指示器
      timeline: false, // 时间轴
      navigationHelpButton: false, // 导航帮助按钮
      scene3DOnly: true, // 仅3D场景
      shouldAnimate: true, // 应该动画
      terrainProvider: terrainProvider
    })
    
    // 隐藏Cesium的logo和版权信息
    viewer.cesiumWidget.creditContainer.style.display = 'none'
    
    // 设置默认视图
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 10000), // 北京
      orientation: {
        heading: 0.0,
        pitch: -Math.PI / 2,
        roll: 0.0
      }
    })
    
    console.log('Cesium Viewer初始化成功')
    return viewer
  } catch (error) {
    console.error('初始化Cesium时发生错误:', error)
    return null
  }
}

/**
 * 加载影像图层
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {string} type - 图层类型: 'osm', 'bing', 'arcgis'
 */
export function loadImageryLayers(viewer, type = 'osm') {
  // 清除现有的影像图层
  viewer.imageryLayers.removeAll()
  
  let layer
  
  switch (type) {
    case 'bing':
      layer = new Cesium.BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        key: 'Ao8A_4-8-P-qstkZQZC4iYlxkfQXRVBYlRFXRJZY7ffA-UyWeLCCpYiKH3Y4tEqp',
        mapStyle: Cesium.BingMapsStyle.AERIAL
      })
      break
    
    case 'arcgis':
      layer = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      })
      break
    
    case 'osm':
    default:
      layer = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      })
      break
  }
  
  viewer.imageryLayers.addImageryProvider(layer)
}

/**
 * 加载地形提供者
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {string} type - 地形类型: 'cesium_world', 'ellipsoid'
 */
export function loadTerrainProvider(viewer, type = 'cesium_world') {
  switch (type) {
    case 'cesium_world':
      viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true
      })
      break
    
    case 'ellipsoid':
    default:
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
      break
  }
}

/**
 * 添加3D模型
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {string} url - 模型URL
 * @param {Object} position - 位置 {longitude, latitude, height}
 * @param {Object} options - 其他选项
 */
export function add3DTileset(viewer, url, position, options = {}) {
  const tileset = new Cesium.Cesium3DTileset({
    url: url,
    ...options
  })
  
  viewer.scene.primitives.add(tileset)
  
  tileset.readyPromise.then((tileset) => {
    // 定位到模型
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        position.longitude,
        position.latitude,
        position.height
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-30),
        roll: 0
      }
    })
  }).catch((error) => {
    console.error('加载3D模型失败:', error)
  })
  
  return tileset
}

/**
 * 添加点云数据
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {string} url - 点云数据URL
 * @param {Object} options - 其他选项
 */
export function addPointCloud(viewer, url, options = {}) {
  const pointCloud = new Cesium.Cesium3DTileset({
    url: url,
    ...options
  })
  
  viewer.scene.primitives.add(pointCloud)
  
  return pointCloud
}

/**
 * 添加GeoJSON数据
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Object} geoJson - GeoJSON数据
 * @param {Object} options - 样式选项
 */
export function addGeoJson(viewer, geoJson, options = {}) {
  const defaultOptions = {
    stroke: Cesium.Color.BLUE,
    fill: Cesium.Color.BLUE.withAlpha(0.5),
    strokeWidth: 3
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  const dataSource = new Cesium.GeoJsonDataSource()
  
  return dataSource.load(geoJson, {
    stroke: mergedOptions.stroke,
    fill: mergedOptions.fill,
    strokeWidth: mergedOptions.strokeWidth
  }).then(() => {
    viewer.dataSources.add(dataSource)
    return dataSource
  })
}

/**
 * 测量距离
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Function} callback - 回调函数，接收测量结果
 */
export function measureDistance(viewer, callback) {
  let positions = []
  let polyline
  let handler
  
  handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  
  // 左键点击添加点
  handler.setInputAction((click) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    
    if (Cesium.defined(cartesian)) {
      positions.push(cartesian)
      
      if (positions.length === 1) {
        polyline = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => positions, false),
            width: 2,
            material: Cesium.Color.YELLOW
          }
        })
      }
      
      if (positions.length >= 2) {
        // 计算距离
        const p1 = Cesium.Cartographic.fromCartesian(positions[positions.length - 2])
        const p2 = Cesium.Cartographic.fromCartesian(positions[positions.length - 1])
        
        const geodesic = new Cesium.EllipsoidGeodesic(p1, p2)
        const distance = geodesic.surfaceDistance
        
        // 转换为公里
        const distanceKilometers = distance / 1000
        
        if (callback) {
          callback(distanceKilometers)
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
  // 右键点击结束测量
  handler.setInputAction(() => {
    handler.destroy()
    
    if (callback) {
      callback(null, true) // 表示测量结束
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  
  return {
    stop: () => {
      handler.destroy()
      viewer.entities.remove(polyline)
    }
  }
}

/**
 * 测量面积
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Function} callback - 回调函数，接收测量结果
 */
export function measureArea(viewer, callback) {
  let positions = []
  let polygon
  let handler
  
  handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  
  // 左键点击添加点
  handler.setInputAction((click) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    
    if (Cesium.defined(cartesian)) {
      positions.push(cartesian)
      
      if (positions.length === 3) {
        polygon = viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => {
              return new Cesium.PolygonHierarchy(positions)
            }, false),
            material: Cesium.Color.YELLOW.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.YELLOW
          }
        })
      }
      
      if (positions.length >= 3) {
        // 计算面积
        const cartographics = positions.map(position => {
          return Cesium.Cartographic.fromCartesian(position)
        })
        
        const area = calculatePolygonArea(cartographics)
        
        if (callback) {
          callback(area)
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
  // 右键点击结束测量
  handler.setInputAction(() => {
    handler.destroy()
    
    if (callback) {
      callback(null, true) // 表示测量结束
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  
  return {
    stop: () => {
      handler.destroy()
      viewer.entities.remove(polygon)
    }
  }
}

/**
 * 计算多边形面积
 * @param {Array} cartographics - 地理坐标点数组
 * @returns {number} - 面积（平方公里）
 */
function calculatePolygonArea(cartographics) {
  if (cartographics.length < 3) {
    return 0
  }
  
  const positions = cartographics.map(cartographic => {
    return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height || 0)
  })
  
  const polygon = new Cesium.PolygonGeometry({
    polygonHierarchy: new Cesium.PolygonHierarchy(positions),
    perPositionHeight: true
  })
  
  const geometry = Cesium.PolygonGeometry.createGeometry(polygon)
  
  // 计算面积
  let area = 0
  
  for (let i = 0; i < geometry.indices.length; i += 3) {
    const i0 = geometry.indices[i]
    const i1 = geometry.indices[i + 1]
    const i2 = geometry.indices[i + 2]
    
    const p0 = new Cesium.Cartesian3(
      geometry.attributes.position.values[i0 * 3],
      geometry.attributes.position.values[i0 * 3 + 1],
      geometry.attributes.position.values[i0 * 3 + 2]
    )
    
    const p1 = new Cesium.Cartesian3(
      geometry.attributes.position.values[i1 * 3],
      geometry.attributes.position.values[i1 * 3 + 1],
      geometry.attributes.position.values[i1 * 3 + 2]
    )
    
    const p2 = new Cesium.Cartesian3(
      geometry.attributes.position.values[i2 * 3],
      geometry.attributes.position.values[i2 * 3 + 1],
      geometry.attributes.position.values[i2 * 3 + 2]
    )
    
    const triangleArea = calculateTriangleArea(p0, p1, p2)
    area += triangleArea
  }
  
  // 转换为平方公里
  return area / 1000000
}

/**
 * 计算三角形面积
 * @param {Cesium.Cartesian3} p0 - 点0
 * @param {Cesium.Cartesian3} p1 - 点1
 * @param {Cesium.Cartesian3} p2 - 点2
 * @returns {number} - 面积
 */
function calculateTriangleArea(p0, p1, p2) {
  const v0 = Cesium.Cartesian3.subtract(p1, p0, new Cesium.Cartesian3())
  const v1 = Cesium.Cartesian3.subtract(p2, p0, new Cesium.Cartesian3())
  
  const cross = Cesium.Cartesian3.cross(v0, v1, new Cesium.Cartesian3())
  const area = 0.5 * Cesium.Cartesian3.magnitude(cross)
  
  return area
}

/**
 * 添加任务可视化
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Object} taskData - 任务数据
 * @param {Object} options - 可视化选项
 * @returns {Object} - 添加的实体集合
 */
export function addTaskVisualization(viewer, taskData, options = {}) {
  if (!taskData || !taskData.features) {
    console.error('任务数据格式不正确')
    return null
  }
  
  const entities = []
  const defaultOptions = {
    pointColor: Cesium.Color.ROYALBLUE,
    lineColor: Cesium.Color.DEEPSKYBLUE,
    polygonColor: Cesium.Color.DEEPSKYBLUE.withAlpha(0.5),
    pointSize: 10,
    lineWidth: 3,
    showLabels: true,
    labelProperty: 'name',
    labelColor: Cesium.Color.WHITE,
    labelOutlineColor: Cesium.Color.BLACK,
    labelOutlineWidth: 2,
    labelFont: '14px sans-serif',
    labelStyle: Cesium.LabelStyle.FILL_AND_OUTLINE,
    labelEyeOffset: new Cesium.Cartesian3(0, 0, -100),
    ...options
  }
  
  // 创建实体集合
  const entityCollection = new Cesium.EntityCollection()
  
  // 处理每个要素
  taskData.features.forEach((feature, index) => {
    const { geometry, properties } = feature
    const id = properties.id || `task-feature-${index}`
    
    if (!geometry) return
    
    const { type, coordinates } = geometry
    let entity
    
    switch (type) {
      case 'Point':
        entity = createPointEntity(viewer, coordinates, properties, defaultOptions)
        break
      
      case 'LineString':
        entity = createLineEntity(viewer, coordinates, properties, defaultOptions)
        break
      
      case 'Polygon':
        entity = createPolygonEntity(viewer, coordinates, properties, defaultOptions)
        break
      
      case 'MultiPoint':
        coordinates.forEach((coord, i) => {
          const pointEntity = createPointEntity(
            viewer, 
            coord, 
            { ...properties, id: `${id}-point-${i}` }, 
            defaultOptions
          )
          entities.push(pointEntity)
          entityCollection.add(pointEntity)
        })
        break
      
      case 'MultiLineString':
        coordinates.forEach((coords, i) => {
          const lineEntity = createLineEntity(
            viewer, 
            coords, 
            { ...properties, id: `${id}-line-${i}` }, 
            defaultOptions
          )
          entities.push(lineEntity)
          entityCollection.add(lineEntity)
        })
        break
      
      case 'MultiPolygon':
        coordinates.forEach((coords, i) => {
          const polygonEntity = createPolygonEntity(
            viewer, 
            coords, 
            { ...properties, id: `${id}-polygon-${i}` }, 
            defaultOptions
          )
          entities.push(polygonEntity)
          entityCollection.add(polygonEntity)
        })
        break
      
      default:
        console.warn(`不支持的几何类型: ${type}`)
        return
    }
    
    if (entity) {
      entities.push(entity)
      entityCollection.add(entity)
    }
  })
  
  return {
    entities,
    entityCollection
  }
}

/**
 * 创建点实体
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Array} coordinates - 坐标 [longitude, latitude, height?]
 * @param {Object} properties - 属性
 * @param {Object} options - 样式选项
 * @returns {Cesium.Entity} - 点实体
 */
function createPointEntity(viewer, coordinates, properties, options) {
  const [longitude, latitude, height = 0] = coordinates
  const id = properties.id || `point-${Date.now()}`
  
  const entity = new Cesium.Entity({
    id,
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    point: {
      pixelSize: options.pointSize,
      color: options.pointColor,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    },
    properties: new Cesium.PropertyBag(properties)
  })
  
  // 添加标签
  if (options.showLabels && properties[options.labelProperty]) {
    entity.label = {
      text: properties[options.labelProperty],
      font: options.labelFont,
      style: options.labelStyle,
      fillColor: options.labelColor,
      outlineColor: options.labelOutlineColor,
      outlineWidth: options.labelOutlineWidth,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      eyeOffset: options.labelEyeOffset,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(0, -10)
    }
  }
  
  return entity
}

/**
 * 创建线实体
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Array} coordinates - 坐标数组 [[longitude, latitude, height?], ...]
 * @param {Object} properties - 属性
 * @param {Object} options - 样式选项
 * @returns {Cesium.Entity} - 线实体
 */
function createLineEntity(viewer, coordinates, properties, options) {
  const id = properties.id || `line-${Date.now()}`
  const positions = coordinates.map(coord => {
    const [longitude, latitude, height = 0] = coord
    return Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  })
  
  const entity = new Cesium.Entity({
    id,
    polyline: {
      positions,
      width: options.lineWidth,
      material: options.lineColor,
      clampToGround: true
    },
    properties: new Cesium.PropertyBag(properties)
  })
  
  // 添加标签
  if (options.showLabels && properties[options.labelProperty]) {
    // 计算线的中点
    const midIndex = Math.floor(coordinates.length / 2)
    const [longitude, latitude, height = 0] = coordinates[midIndex]
    
    entity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    entity.label = {
      text: properties[options.labelProperty],
      font: options.labelFont,
      style: options.labelStyle,
      fillColor: options.labelColor,
      outlineColor: options.labelOutlineColor,
      outlineWidth: options.labelOutlineWidth,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      eyeOffset: options.labelEyeOffset,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(0, -10)
    }
  }
  
  return entity
}

/**
 * 创建多边形实体
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Array} coordinates - 坐标数组 [[[longitude, latitude, height?], ...], ...]
 * @param {Object} properties - 属性
 * @param {Object} options - 样式选项
 * @returns {Cesium.Entity} - 多边形实体
 */
function createPolygonEntity(viewer, coordinates, properties, options) {
  const id = properties.id || `polygon-${Date.now()}`
  const hierarchy = new Cesium.PolygonHierarchy(
    coordinates[0].map(coord => {
      const [longitude, latitude, height = 0] = coord
      return Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    })
  )
  
  const entity = new Cesium.Entity({
    id,
    polygon: {
      hierarchy,
      material: options.polygonColor,
      outline: true,
      outlineColor: options.lineColor,
      outlineWidth: options.lineWidth,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    },
    properties: new Cesium.PropertyBag(properties)
  })
  
  // 添加标签
  if (options.showLabels && properties[options.labelProperty]) {
    // 计算多边形的中心点
    const points = coordinates[0].map(coord => [coord[0], coord[1]])
    const centroid = turf.centroid(turf.polygon([points]))
    const [longitude, latitude] = centroid.geometry.coordinates
    
    entity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude)
    entity.label = {
      text: properties[options.labelProperty],
      font: options.labelFont,
      style: options.labelStyle,
      fillColor: options.labelColor,
      outlineColor: options.labelOutlineColor,
      outlineWidth: options.labelOutlineWidth,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      eyeOffset: options.labelEyeOffset,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(0, -10)
    }
  }
  
  return entity
}

/**
 * 执行空间分析
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {String} analysisType - 分析类型: 'buffer', 'intersection', 'union', 'difference'
 * @param {Object} data - 分析数据
 * @param {Object} options - 分析选项
 * @returns {Object} - 分析结果
 */
export function performSpatialAnalysis(viewer, analysisType, data, options = {}) {
  if (!data || !data.features) {
    console.error('数据格式不正确')
    return null
  }
  
  const defaultOptions = {
    bufferDistance: 1, // 缓冲区距离（公里）
    bufferSteps: 64, // 缓冲区步数
    resultColor: Cesium.Color.YELLOW.withAlpha(0.5),
    resultLineColor: Cesium.Color.YELLOW,
    resultLineWidth: 3,
    ...options
  }
  
  let result
  
  switch (analysisType) {
    case 'buffer':
      result = performBufferAnalysis(data, defaultOptions.bufferDistance, defaultOptions.bufferSteps)
      break
    
    case 'intersection':
      result = performIntersectionAnalysis(data)
      break
    
    case 'union':
      result = performUnionAnalysis(data)
      break
    
    case 'difference':
      result = performDifferenceAnalysis(data)
      break
    
    default:
      console.error(`不支持的分析类型: ${analysisType}`)
      return null
  }
  
  if (result) {
    // 可视化分析结果
    const visualizationOptions = {
      polygonColor: defaultOptions.resultColor,
      lineColor: defaultOptions.resultLineColor,
      lineWidth: defaultOptions.resultLineWidth,
      showLabels: true,
      labelProperty: 'name',
    }
    
    return addTaskVisualization(viewer, result, visualizationOptions)
  }
  
  return null
}

/**
 * 执行缓冲区分析
 * @param {Object} data - GeoJSON数据
 * @param {Number} distance - 缓冲区距离（公里）
 * @param {Number} steps - 缓冲区步数
 * @returns {Object} - 缓冲区GeoJSON
 */
function performBufferAnalysis(data, distance, steps) {
  try {
    const features = []
    
    data.features.forEach((feature, index) => {
      const buffered = turf.buffer(feature, distance, { steps })
      
      if (buffered) {
        buffered.properties = {
          ...feature.properties,
          id: `buffer-${feature.properties.id || index}`,
          name: `${feature.properties.name || '要素'} 缓冲区`,
          analysisType: 'buffer',
          distance
        }
        
        features.push(buffered)
      }
    })
    
    return {
      type: 'FeatureCollection',
      features
    }
  } catch (error) {
    console.error('执行缓冲区分析时出错:', error)
    return null
  }
}

/**
 * 执行相交分析
 * @param {Object} data - GeoJSON数据（需要包含两个要素）
 * @returns {Object} - 相交结果GeoJSON
 */
function performIntersectionAnalysis(data) {
  try {
    if (data.features.length < 2) {
      console.error('相交分析需要至少两个要素')
      return null
    }
    
    const feature1 = data.features[0]
    const feature2 = data.features[1]
    
    const intersection = turf.intersect(feature1, feature2)
    
    if (intersection) {
      intersection.properties = {
        id: `intersection-${Date.now()}`,
        name: '相交结果',
        analysisType: 'intersection',
        feature1Id: feature1.properties.id,
        feature2Id: feature2.properties.id
      }
      
      return {
        type: 'FeatureCollection',
        features: [intersection]
      }
    }
    
    return null
  } catch (error) {
    console.error('执行相交分析时出错:', error)
    return null
  }
}

/**
 * 执行合并分析
 * @param {Object} data - GeoJSON数据
 * @returns {Object} - 合并结果GeoJSON
 */
function performUnionAnalysis(data) {
  try {
    if (data.features.length < 2) {
      console.error('合并分析需要至少两个要素')
      return null
    }
    
    let union = data.features[0]
    
    for (let i = 1; i < data.features.length; i++) {
      union = turf.union(union, data.features[i])
    }
    
    if (union) {
      union.properties = {
        id: `union-${Date.now()}`,
        name: '合并结果',
        analysisType: 'union',
        featureIds: data.features.map(f => f.properties.id).join(',')
      }
      
      return {
        type: 'FeatureCollection',
        features: [union]
      }
    }
    
    return null
  } catch (error) {
    console.error('执行合并分析时出错:', error)
    return null
  }
}

/**
 * 执行差异分析
 * @param {Object} data - GeoJSON数据（需要包含两个要素）
 * @returns {Object} - 差异结果GeoJSON
 */
function performDifferenceAnalysis(data) {
  try {
    if (data.features.length < 2) {
      console.error('差异分析需要至少两个要素')
      return null
    }
    
    const feature1 = data.features[0]
    const feature2 = data.features[1]
    
    const difference = turf.difference(feature1, feature2)
    
    if (difference) {
      difference.properties = {
        id: `difference-${Date.now()}`,
        name: '差异结果',
        analysisType: 'difference',
        feature1Id: feature1.properties.id,
        feature2Id: feature2.properties.id
      }
      
      return {
        type: 'FeatureCollection',
        features: [difference]
      }
    }
    
    return null
  } catch (error) {
    console.error('执行差异分析时出错:', error)
    return null
  }
}

/**
 * 加载项目数据
 * @param {Cesium.Viewer} viewer Cesium Viewer实例
 * @returns {Promise<void>}
 */
export async function loadProjectData(viewer) {
  if (!viewer) {
    console.error('Viewer未初始化')
    return
  }
  
  try {
    console.log('加载项目数据...')
    
    // 模拟项目数据
    const mockProjects = [
      {
        id: 1,
        name: '项目A',
        description: '这是项目A的描述',
        position: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 100), // 北京
        status: '进行中',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      },
      {
        id: 2,
        name: '项目B',
        description: '这是项目B的描述',
        position: Cesium.Cartesian3.fromDegrees(121.4, 31.2, 100), // 上海
        status: '已完成',
        startDate: '2022-06-01',
        endDate: '2023-06-30'
      },
      {
        id: 3,
        name: '项目C',
        description: '这是项目C的描述',
        position: Cesium.Cartesian3.fromDegrees(114.0, 22.5, 100), // 深圳
        status: '计划中',
        startDate: '2023-07-01',
        endDate: '2024-07-31'
      }
    ]
    
    // 添加项目标记
    mockProjects.forEach(project => {
      viewer.entities.add({
        id: `project-${project.id}`,
        position: project.position,
        billboard: {
          image: '/src/assets/marker.png',
          width: 32,
          height: 32,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        },
        label: {
          text: project.name,
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -36)
        }
      })
    })
    
    console.log('项目数据加载完成')
    return mockProjects
  } catch (error) {
    console.error('加载项目数据失败:', error)
    throw error
  }
}

export default {
  initCesium,
  loadImageryLayers,
  loadTerrainProvider,
  add3DTileset,
  addPointCloud,
  addGeoJson,
  measureDistance,
  measureArea,
  calculatePolygonArea,
  calculateTriangleArea,
  addTaskVisualization,
  performSpatialAnalysis,
  loadProjectData
}
