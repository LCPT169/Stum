import {PageContainer} from '@ant-design/pro-layout';
import styles from './style.less';
import React, {useEffect, useState} from 'react';
import * as Cesium from 'cesium';
import './Widgets/widgets.css';
import './cesium';
import {Col, InputNumber, Row, Slider} from 'antd';
import {getTreeDataApi} from "@/services/ant-design-pro/api";

window.CESIUM_BASE_URL = window.location.protocol + '//' + window.location.host;

let viewer
let tileset
let classificationData = [];
let msg
//模型url
const modelUrl = 'http://localhost:8001/data01/tileset.json';
const getLocation = async () => {
  const h1 = await getTreeDataApi();
  return h1.center;
}
msg = await getLocation();

//初始位置，方向
let modelLocation = {
  longitude: msg.longitude, //经度119.013776
  latitude: msg.latitude, //纬度30.081111
  height: 55.4,       //高度55.4  587.1564135953184
  elevation: msg.elevation,
  rx: -87.8,    //X轴|Roll|0
  ry: 1,     //Y轴|Heading|176.46
  rz: -0.7,      //Z轴|Pitch|-59.13
  scale: 1
}
//相机位置
let cameraLocation = {
  longitude: modelLocation.longitude + 0.000407,
  latitude: modelLocation.latitude - 0.002024,
  height: 1000,
  heading: 345,//10
  pitch: -59.13,//-60
  roll: 0,//0.025883251314954971306,
}
const Zesium = () => {
  //控件
  const content = (
    <div className={styles.pageHeaderContent}>
      <p
        className={styles.contentLink}
        style={{
          marginTop: 0,
        }}
      >
        Cesium三维模型
      </p>
      <Row id="val_rx">
        <Col span={4}>
          <InputNumber
            addonBefore={'经度'}
            controls={true}
            min={-180}
            max={180}
            step={0.00001}
            style={{margin: '5 16px'}}
            value={modelLocation.longitude}
            onChange={(val_tx) => {
              if (val_tx !== null) {
                handleVal_tx(val_tx);
                modelLocation.longitude = val_tx;
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            step={0.1}
            addonBefore={'X轴'}
            min={-180}
            max={180}
            style={{margin: '0 16px'}}
            value={modelLocation.rx}
            onChange={(val_rx) => {
              if (val_rx !== null) {
                modelLocation.rx = val_rx;
                handleVal_rx(modelLocation.rx);
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
        <Col span={12}>
          <Slider
            step={1}
            min={-180}
            max={180}
            onChange={(val_rx) => {
              modelLocation.rx = val_rx;
              handleVal_rx(modelLocation.rx);
              update3DTiles(modelLocation);
            }}
            value={typeof modelLocation.rx === 'number' ? modelLocation.rx : 0}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            addonBefore={'模型大小'}
            controls={true}
            min={0}
            max={100}
            step={0.1}
            style={{margin: '0 16px'}}
            value={modelLocation.scale}
            onChange={(val_scale) => {
              if (val_scale !== null) {
                handleVal_scale(val_scale);
                modelLocation.scale = val_scale;
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
      </Row>
      <Row id="val_ry">
        <Col span={4}>
          <InputNumber
            addonBefore={'纬度'}
            controls={true}
            min={-180}
            max={180}
            step={0.00001}
            style={{margin: '5 16px'}}
            value={modelLocation.latitude}
            onChange={(val_ty) => {
              if (val_ty !== null) {
                handleVal_ty(val_ty);
                modelLocation.latitude = val_ty;
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            addonBefore={'Y轴'}
            step={0.1}
            min={-180}
            max={180}
            style={{margin: '0 16px'}}
            value={modelLocation.ry}
            onChange={(val_ry) => {
              if (val_ry !== null) {
                modelLocation.ry = val_ry;
                handleVal_ry(modelLocation.ry);
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
        <Col span={12}>
          <Slider
            step={1}
            min={-180}
            max={180}
            onChange={(val_ry) => {
              modelLocation.ry = val_ry;
              handleVal_ry(modelLocation.ry);
              update3DTiles(modelLocation);
            }}
            value={typeof modelLocation.ry === 'number' ? modelLocation.ry : 0}
          />
        </Col>

      </Row>
      <Row id="val_rz">
        <Col span={4}>
          <InputNumber
            addonBefore={'高度'}
            controls={true}
            min={-9999}
            max={9999}
            step={1}
            style={{margin: '5 16px'}}
            value={modelLocation.height}
            onChange={(val_tz) => {
              if (val_tz !== null) {
                handleVal_tz(val_tz)
                modelLocation.height = val_tz;
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            addonBefore={'Z轴'}
            step={0.1}
            min={-180}
            max={180}
            style={{margin: '0 16px'}}
            value={modelLocation.rz}
            onChange={(val_rz) => {
              if (val_rz !== null) {
                modelLocation.rz = val_rz;
                handleVal_rz(modelLocation.rz);
                update3DTiles(modelLocation);
              }
            }}
          />
        </Col>
        <Col span={12}>
          <Slider
            step={1}
            min={-180}
            max={180}
            onChange={(val_rz) => {
              modelLocation.rz = val_rz;
              handleVal_rz(modelLocation.rz);
              update3DTiles(modelLocation);
            }}
            value={typeof modelLocation.rz === 'number' ? modelLocation.rz : 0}
          />
        </Col>
      </Row>
    </div>
  );
  //修改模型位置、方向、大小
  const [val_tx, handleVal_tx] = useState(modelLocation.longitude);
  const [val_ty, handleVal_ty] = useState(modelLocation.latitude);
  const [val_tz, handleVal_tz] = useState(modelLocation.height);
  const [val_rx, handleVal_rx] = useState(modelLocation.rx);
  const [val_ry, handleVal_ry] = useState(modelLocation.ry);
  const [val_rz, handleVal_rz] = useState(modelLocation.rz);
  const [val_scale, handleVal_scale] = useState(modelLocation.scale);
  //三维坐标->极坐标
  const cartesianToCartographic = cartesian3 => {
    let ellipsoid = viewer.scene.globe.ellipsoid
    return ellipsoid.cartesianToCartographic(cartesian3)
  }
  //极坐标->经纬度坐标
  const cartographicToLngLatHeight = (cartographic) => {
    if (!(cartographic instanceof Cesium.Cartographic)) {
      throw new Error(` (cartographicToLngLatHeight:) 参数错误:"${cartographic}"`)
    }
    let longitude = Cesium.Math.toDegrees(cartographic.longitude)
    let latitude = Cesium.Math.toDegrees(cartographic.latitude)
    let height = cartographic.height
    return [longitude, latitude, height]
  }
  //三维坐标->经纬度坐标
  const cartesianToLngLatHeight = (cartesian3) => {
    if (!(cartesian3 instanceof Cesium.Cartesian3)) {
      throw new Error(` (cartesianToLngLatHeight:) 参数错误:"${cartesian3}"`)
    }
    let cartographic = cartesianToCartographic(cartesian3)
    if (cartographic) {
      return cartographicToLngLatHeight(cartographic)
    }
  }
  //获取模型地形高度
  let getHeightModel = async (longitude, latitude) => {
    const cartesian = [new Cesium.Cartesian3.fromDegrees(longitude, latitude)];
    return new Promise(async resolve => {
      try {
        let promise = viewer.scene.clampToHeightMostDetailed(cartesian);
        promise.then(updatedCartesians => {
          resolve(cartesianToLngLatHeight(updatedCartesians[0])[2])
        })
      } catch (e) {
        resolve(false)
      }
    })
  }
  //获取地形高度
  let getHeightTerrain = async (longitude, latitude) => {
    const cartesian = [new Cesium.Cartesian3.fromDegrees(longitude, latitude)]
    // 首先将cartesians转为positions
    let positions = []
    cartesian.forEach(cartesian => {
      positions.push(cartesianToCartographic(cartesian))
    })
    let terrain = viewer.terrainProvider
    return new Promise(async resolve => {
      try {
        // 当前场景中没有使用地形
        if (!terrain) resolve(false)
        let promise = Cesium.sampleTerrainMostDetailed(terrain, positions);
        Cesium.when(promise, (updatedPositions) => {
          let resultCartesians = []
          updatedPositions.forEach(position => {
            if (position) {
              // 采集成功，转为笛卡尔坐标
              resultCartesians.push(cartographicToLngLatHeight(position))
            } else {
              // 采集失败，postion为undefined
              resultCartesians.push(position)
            }
          })
          resolve(resultCartesians[0][2])
        })
      } catch (e) {
        resolve(false)
      }
    })
  }

  //Cesium加载
  async function creatCesium() {
    // 创建Cesium Viewer
    viewer = new Cesium.Viewer('cesiumContainer', {
      // 加载天地图
      terrainProvider: Cesium.createWorldTerrain({
        requestWaterMask: true,
        // 运动的水
        requestVertexNormals: false, // 加载光数据
      }),
      scene3DOnly: true,
      selectionIndicator: true,
      baseLayerPicker: false,
      timeline: false,
      sceneModePicker: false,
      animation: false,
      fullscreenButton: false,
    });
    //开启地下可视化调整高度
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    viewer.scene.globe.translucency.enabled = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    //隐藏Cesium-logo
    viewer.cesiumWidget.creditContainer.style.display = 'none';
    //显示地形
    viewer.scene.globe.depthTestAgainstTerrain = true;
    /*配置视窗*/
    //基于太阳位置的光照
    //viewer.scene.globe.enableLighting = true;

    /*初始化相机*/
    //位置
    let initialPosition = new Cesium.Cartesian3.fromDegrees(
      cameraLocation.longitude, cameraLocation.latitude, cameraLocation.height
    );
    //（经度，纬度，高度）
    //方向
    let initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
      cameraLocation.heading, cameraLocation.pitch, cameraLocation.roll
    );
    //（左右，上下，左右倾斜）【正：右，负：左】
    // 设置初始视角
    let homeCameraView = {
      destination: initialPosition,
      orientation: {
        heading: initialOrientation.heading,
        pitch: initialOrientation.pitch,
        roll: initialOrientation.roll,
      },
    };
    //更新home按钮
    viewer.scene.camera.setView(homeCameraView); //添加飞行动画选项

    homeCameraView.duration = 2; //持续时间

    homeCameraView.maximumHeight = 2000;
    homeCameraView.pitchAdjustHeight = 2000;
    homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;

    // 覆盖默认的 home 按钮
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true;
        viewer.scene.camera.flyTo(homeCameraView);
      });
  }

  //更新3D数据
  const update3DTiles = modelLocation => {
    let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(modelLocation.rx));
    let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(modelLocation.ry));
    let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(modelLocation.rz));
    let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
    let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
    let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
    //平移
    let position = Cesium.Cartesian3.fromDegrees(modelLocation.longitude, modelLocation.latitude, modelLocation.height);
    let m = Cesium.Transforms.eastNorthUpToFixedFrame(position); //旋转、平移矩阵相乘
    Cesium.Matrix4.multiply(m, rotationX, m);
    Cesium.Matrix4.multiply(m, rotationY, m);
    Cesium.Matrix4.multiply(m, rotationZ, m);
    //赋值给tileset
    tileset._root.transform = m;
    //更改模型大小
    let scale = Cesium.Matrix4.fromUniformScale(modelLocation.scale);
    Cesium.Matrix4.multiply(m, scale, m);
  }

  //3D模型加载
  async function loadModel() {
    //加载3D模型
    tileset = new Cesium.Cesium3DTileset({
      url: modelUrl,
      maximumScreenSpaceError: 2, //最大的屏幕空间误差
      maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
    });
    //获取地形高度
    getHeightTerrain(msg.longitude, msg.latitude).then(results => {
      modelLocation.height = results-msg.elevation;
      handleVal_tz(modelLocation.height);
      //console.log('demo: 拾取结果：', results)
    })
    //添加到场景
    tileset.readyPromise.then(viewer.scene.primitives.add(tileset));
    //更新模型数据
    tileset.readyPromise.then((tileset) => {
      update3DTiles(modelLocation);
      //viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
    });
  }

  //请求树木信息
  const getTreeData = async () => {
    try {
      const treeDataJson = await getTreeDataApi();
      console.log("树木信息：", treeDataJson.tree);
      return treeDataJson.tree;
    } catch (error) {
      console.log("获取树木信息失败");
    }
  }
  //提取树木检测数据并添加颜色
  const treeFunction = async () => {
    //在后端获取treeDataJson.tree
    getTreeData().then(async treeData => {
      //单体化处理
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].height > 1000) {
          continue;
        }
        let topLongitude = treeData[i].top_longitude;
        let topLatitude = treeData[i].top_latitude;
        let butLogitude = treeData[i].but_longitude;
        let butLatitude = treeData[i].but_latitude;
        let treeHeight = treeData[i].height;
        let name = treeData[i].name;
        let guanfu = treeData[i].guanfu;
        let dbh = treeData[i].dbh;
        let elevation = treeData[i].elevation;
        let tElevation
        let obj = {
          id: "volume" + i,
          name: name,
          longitude: (topLongitude + butLogitude) / 2,
          latitude: (topLatitude + butLatitude) / 2,
          treeHeight: treeHeight,
          guanfu: guanfu,
          dbh: dbh,
          elevation: elevation
        };
        //获取该点模型高度
        await getHeightModel(obj.longitude, obj.latitude).then(result => {
          tElevation = result;
        })
        let center = new Cesium.Cartesian3.fromDegrees(
          (topLongitude + butLogitude) / 2,
          (topLatitude + butLatitude) / 2,
          tElevation);
        //椭球上方的高度，地形高度
        //模型坐标转为世界坐标
        let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        //将obj放入单体化信息
        classificationData.push(obj);
        //上色
        viewer.scene.primitives.add(
          new Cesium.ClassificationPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: Cesium.BoxGeometry.fromDimensions({
                vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                // Math.abs(topLongitude - butLogitude) / 360 * 2 * (2 * Math.PI * 6371004),
                // Math.abs(topLatitude - butLatitude) / 360 * 2 * (2 * Math.PI * 6371004),
                dimensions: new Cesium.Cartesian3(
                  Math.abs(topLongitude - butLogitude) * 110946,
                  Math.abs(topLatitude - butLatitude) * 110946,
                  treeHeight / 2),//长度
              }),
              modelMatrix: modelMatrix,
              attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                  new Cesium.Color(Math.random(), Math.random(), Math.random(), 0.5)
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true),
              },
              id: obj.id,
            }),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
          }));
      }
    });
  };
  //设置鼠标事件
  const mouseMoveFunction = () => {
    let currentObjectId;
    let currentPrimitive;
    let currentColor;
    let currentShow;
    let attributes;

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
      let pickedObject = viewer.scene.pick(movement.endPosition);
      if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        if (pickedObject.id === currentObjectId) {
          return;
        }

        if (Cesium.defined(currentObjectId)) {
          attributes = currentPrimitive.getGeometryInstanceAttributes(
            currentObjectId
          );
          attributes.color = currentColor;
          attributes.show = currentShow;
          currentObjectId = undefined;
          currentPrimitive = undefined;
          currentColor = undefined;
          currentShow = undefined;
        }
      }

      if (Cesium.defined(pickedObject) &&
        Cesium.defined(pickedObject.primitive) &&
        Cesium.defined(pickedObject.id) &&
        Cesium.defined(pickedObject.primitive.getGeometryInstanceAttributes)) {
        currentObjectId = pickedObject.id;
        currentPrimitive = pickedObject.primitive;
        attributes = currentPrimitive.getGeometryInstanceAttributes(
          currentObjectId
        );
        currentColor = attributes.color;
        currentShow = attributes.show;
        if (!viewer.scene.invertClassification) {
          attributes.color = [255, 255, 255, 128];
        }
        attributes.show = [1];


      } else if (Cesium.defined(currentObjectId)) {
        attributes = currentPrimitive.getGeometryInstanceAttributes(
          currentObjectId
        );
        attributes.color = currentColor;
        attributes.show = currentShow;
        currentObjectId = undefined;
        currentPrimitive = undefined;
        currentColor = undefined;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 获取默认的左键单击处理程序，用于在左键单击时未拾取要素
    let clickHandler = viewer.screenSpaceEventHandler.getInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    // 在信息框中显示选定内容和元数据
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
        movement
      ) {
        // 点击新要素
        let pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature)) {
          clickHandler(movement);
          return;
        }
        //设置鼠标事件
        let selectedEntity = new Cesium.Entity();
        //遍历寻找目标:显示当先树木信息
        let o;
        for (let obj in classificationData) {
          if (pickedFeature.id === undefined) {
            return;
          } else if (classificationData[obj].id === pickedFeature.id) {
            o = classificationData[obj]
            // 设置要素信息框描述
            selectedEntity.name = "树木信息";
            selectedEntity.description =
              'Loading<div class="cesium-infoBox-loading"></div>';
            viewer.selectedEntity = selectedEntity;
            selectedEntity.description =
              '<table class="cesium-infoBox-defaultTable"><tbody>' +
              "<tr><th>树种</th><td>" +
              "山核桃树" +
              "</td></tr>" +
              "<tr><th>树高</th><td>" +
              o.treeHeight + " m" +
              "</td></tr>" +
              "<tr><th>冠幅</th><td>" +
              o.guanfu + " m" +
              "</td></tr>" +
              "<tr><th>胸径</th><td>" +
              o.dbh + " m" +
              "</td></tr>" +
              "<tr><th>经度</th><td>" +
              o.longitude +
              "</td></tr>" +
              "<tr><th>纬度</th><td>" +
              o.latitude +
              "</td></tr>" +
              "<tr><th>海拔</th><td>" +
              o.elevation +
              "</td></tr>" +
              "</tbody></table>";
            break;
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  useEffect(() => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZTQ0NzU5MS0wMzUzLTQ2MmItYjBjNC0yYjYzMTk2YTlhYTkiLCJpZCI6Nzk3OTYsImlhdCI6MTY0MzI3MzQ3MH0.lrdjEm7yghHeZFsUd8kNl1dYnwSoKVGWEik9OBltwro';
    //加载模型后再添加模型
    const loadCesium = () => {
      creatCesium().then(loadModel);
    }
    loadCesium();
    treeFunction();
    mouseMoveFunction();
  }, []);

  return (
    <PageContainer className={styles.page} content={content}>
      <div className="App">
        <div id={'cesiumContainer'}/>
      </div>
    </PageContainer>
  );
};
export default Zesium;
