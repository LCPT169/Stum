import {PageContainer} from '@ant-design/pro-layout';
import styles from './style.less';
import React, {useEffect, useState} from 'react';
import * as Cesium from 'cesium';
import './Widgets/widgets.css';
import './cesium';
import {Col, Descriptions, InputNumber, Row, Slider, Tabs} from 'antd';
import {getTreeDataApi} from "@/services/ant-design-pro/api";
import Decimal from 'decimal.js';

window.CESIUM_BASE_URL = window.location.protocol + '//' + window.location.host;
const {TabPane} = Tabs;

function callback(key) {
  // console.log(key);
}

//设置初始变量
let viewer//cesium 视窗
let tileset//3D模型
let classificationData = [];//单体化信息存储
let treeInfo//初始化信息
//获取模型中心位置
let getLocationUrl
//获取到tree_coordinate.json
const getJson = async () => {
  // getLocationUrl = "/api/odmoutput/" + localStorage.getItem('rid') + "/tree_coordinate.json"
  getLocationUrl = "http://localhost:8080/api/odmoutput/repo-886145cd553b4d5e88ce774507f9551a/tree_coordinate.json"
  console.log('getLocation url:', getLocationUrl);
  const body = {};
  console.log('rid:', localStorage.getItem('rid'));
  body['rid'] = "repo-886145cd553b4d5e88ce774507f9551a";
  console.log('body', body);
  return await getTreeDataApi(getLocationUrl, body);
}
//模型3D_tiles的url
let modelUrl
const setModelUrl = async () => {
  // console.log('cesium get rid', localStorage.getItem('rid'));
  modelUrl = "/api/odmoutput/" + localStorage.getItem('rid') + "/odm_texturing/Batchedodm_textured_model_geo/tileset.json";
  // modelUrl=
}
//初始化
let msg
//模型位置
let modelLocation = {
  longitude: 119.013776, //经度119.013776
  latitude: 30.081111, //纬度30.081111
  height: 55.4,       //高度
  elevation: 400,
  rx: -87.8,    //X轴|Roll|0
  ry: 1,     //Y轴|Heading|176.46
  rz: -0.7,      //Z轴|Pitch|-59.13
  scale: 1.035
}
//相机位置
let cameraLocation = {
  longitude: 0, //modelLocation.longitude + 0.000407,
  latitude: 0,//modelLocation.latitude - 0.002024,
  height: 0,//msg.elevation + 300,
  heading: 345,//10
  pitch: -55,//-60
  roll: 0,//0.025883251314954971306,
}
const cesium = () => {
  const [t_Height, setT_Height] = useState('--');
  const [t_elevation, setT_elevation] = useState('--');
  const [t_output, setT_output] = useState('--');
  const [t_guanfu, setT_guanfu] = useState('--');
  //修改模型位置、方向、大小
  const [val_tx, handleVal_tx] = useState(modelLocation.longitude);
  const [val_ty, handleVal_ty] = useState(modelLocation.latitude);
  const [val_tz, handleVal_tz] = useState(modelLocation.height);
  const [val_rx, handleVal_rx] = useState(modelLocation.rx);
  const [val_ry, handleVal_ry] = useState(modelLocation.ry);
  const [val_rz, handleVal_rz] = useState(modelLocation.rz);
  const [val_scale, handleVal_scale] = useState(modelLocation.scale);

  //控件
  const content = (
    <div className={styles.pageHeaderContent}>
      <Tabs size={'small'} onChange={callback} type="card" style={{padding: 0, margin: 0}}>
        <TabPane tab="山核桃林信息" key="1">
          <Descriptions
            bordered
            column={{xxl: 7, xl: 7, lg: 3, md: 3, sm: 3, xs: 1}}
            layout={'vertical'}
          >
            <Descriptions.Item span={2} label="任务名">{localStorage.getItem('name')}</Descriptions.Item>
            <Descriptions.Item label="海拔">{t_elevation} m</Descriptions.Item>
            <Descriptions.Item label="总预估产量">{t_output} kg</Descriptions.Item>
            <Descriptions.Item label="平均树高">{t_Height} m</Descriptions.Item>
            <Descriptions.Item label="平均冠幅">{t_guanfu} m²</Descriptions.Item>
          </Descriptions>
        </TabPane>
        <TabPane tab="模型调整" key="2">
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
                step={0.005}
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
                step={0.1}
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
        </TabPane>
      </Tabs>

    </div>
  );

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
        console.log('请求错误：', e);
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
  //请求树木信息
  const getTreeData = async () => {
    try {
      const treeDataJson = await getTreeDataApi(getLocationUrl);
      // console.log("树木信息：", treeDataJson.tree);
      return treeDataJson.tree;
    } catch (error) {
      console.log("获取树木信息失败");
    }
  }
  //提取树木检测数据并添加颜色
  const treeFunction = async () => {
    //在后端获取treeDataJson.tree
    await getTreeData().then(async treeData => {
      //单体化处理
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].height > 30) {
          continue;
        }

        try {
          //需要使用Number()全部转为数字，否则可能识别为字符串
          let topLongitude = Number(treeData[i].top_longitude);
          let topLatitude = Number(treeData[i].top_latitude);
          let butLogitude = Number(treeData[i].but_longitude);
          let butLatitude = Number(treeData[i].but_latitude);
          let treeHeight = Number(treeData[i].height);
          let name = i//treeData[i].name;
          let guanfu = Number(treeData[i].guanfu);
          //胸径 let dbh = treeData[i].dbh;
          let elevation = Number(treeData[i].tree_elevation);
          let tElevation;
          let topElevation;
          let butElevation;
          //处理经纬度
          let longitude = (topLongitude + butLogitude) / 2;
          let latitude = (topLatitude + butLatitude) / 2;
          let obj = {
            id: "volume" + i,
            name: name,
            longitude: longitude,
            latitude: latitude,
            treeHeight: treeHeight,
            guanfu: guanfu,
            elevation: elevation,
            output: guanfu * guanfu * 0.099 + guanfu * 1.211 + 6.766
          };
          //获取该点模型高度
          await getHeightModel(obj.longitude, obj.latitude).then(result => {
            tElevation = result;
          })
          await getHeightModel(topLongitude, topLatitude).then(result => {
            topElevation = result;
          })
          await getHeightModel(butLogitude, butLatitude).then(result => {
            butElevation = result;
          })
          if (tElevation === 0 || topElevation === 0 || butElevation === 0) {
            continue;
          }
          let centerHeight = (topElevation + butElevation) / 2;
          let subtraction = Math.abs(centerHeight - tElevation);

          if (subtraction < 0.5) {//0.6
            continue;
          }
          let center = new Cesium.Cartesian3.fromDegrees(
            (topLongitude + butLogitude) / 2,
            (topLatitude + butLatitude) / 2,
            tElevation + treeHeight/4 -1.8);//treeHeight*1/4);//+treeHeight/2);
          //椭球上方的高度，地形高度
          //模型坐标转为世界坐标
          let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
          //将obj放入单体化信息
          classificationData.push(obj);
          //上色
          //   Math.abs(topCartesian3.x - butCartesian3.x),
          //     Math.abs(butCartesian3.y - butCartesian3.y),
          //     treeHeight
                      // Math.abs(topCartesian3.x - butCartesian3.x),
                      // Math.abs(topCartesian3.y - butCartesian3.y),
          viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
              geometryInstances: new Cesium.GeometryInstance({
                geometry: Cesium.BoxGeometry.fromDimensions({
                  vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                  dimensions:
                    new Cesium.Cartesian3(
                      Math.abs(topLongitude - butLogitude) * 110946,
                      Math.abs(topLatitude - butLatitude) * 110946,
                      treeHeight),
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

        } catch (error) {
          console.log('错误：', error);
        }

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
              "<tr><th>树种</th><td>" + "山核桃树" +// o.name +
              "</td></tr>" + "<tr><th>树高</th><td>" + o.treeHeight + " m" +
              "</td></tr>" + "<tr><th>冠幅</th><td>" + o.guanfu + " m²" +
              "</td></tr>" + "<tr><th>产量</th><td>" + o.output.toFixed(2) + " kg" +
              "</td></tr>" + "<tr><th>海拔</th><td>" + o.elevation + " m" +
              "</td></tr>" + "<tr><th>经度</th><td>" + o.longitude +
              "</td></tr>" + "<tr><th>纬度</th><td>" + o.latitude +
              "</td></tr>" + "</tbody></table>";
            break;
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  //Cesium加载
  async function creatCesium() {
    // 创建Cesium Viewer
    viewer = new Cesium.Viewer('cesiumContainer', {
      // 加载天地图
      terrainProvider: Cesium.createWorldTerrain({
        requestWaterMask: true,// 运动的水
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
    viewer.scene.light = new Cesium.DirectionalLight({
      //去除时间原因影响模型颜色
      direction: new Cesium.Cartesian3(0.35492591601301104, -0.8909182691839401, -0.2833588392420772)
    })
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 150;
    //开启地下可视化调整高度
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
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

  //3D模型加载
  async function loadModel() {
    //加载3D模型
    tileset = new Cesium.Cesium3DTileset({
      url: modelUrl,
      maximumScreenSpaceError: 2, //最大的屏幕空间误差
      maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
    });
    //获取地形高度
    await getHeightTerrain(msg.longitude, msg.latitude).then(results => {
      modelLocation.height = Math.abs(msg.elevation - results);
      handleVal_tz(modelLocation.height);
      update3DTiles(modelLocation);
    })
    //添加到场景
    tileset.readyPromise.then(viewer.scene.primitives.add(tileset));
    //更新模型数据
    tileset.readyPromise.then((tileset) => {
      update3DTiles(modelLocation);
      //viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));

    });
  }
  useEffect(async () => {
    await setModelUrl();
    await getJson().then((json) => {
      /*对模型中心位置操作*/
      console.log("json:", json);
      let center = json.center;
      //赋值给全局变量msg
      msg = center
      console.log("center:", center);
      modelLocation.longitude = center.longitude;
      modelLocation.latitude = center.latitude;
      modelLocation.elevation = center.elevation;
      handleVal_tx(modelLocation.longitude);
      handleVal_ty(modelLocation.latitude);
      handleVal_tz(modelLocation.elevation);
      cameraLocation.longitude = center.longitude + 0.000407;
      cameraLocation.latitude = center.latitude - 0.002024;
      cameraLocation.height = center.elevation + 250;//300

      /*初始化信息*/
      let avgHeight = 0;
      let avgGuanfu = 0;
      let totaloutput = 0;
      let n = json.tree.length;
      let m = n
      //对每一棵树进行操作
      for (let i = 0; i < m; i++) {
        // 对树高不正常的树木进行剔除
        if (json.tree[i].height > 40 || json.tree[i].height < 3) {
          n--;
          continue
        }
        //使用parsefloat将高度转为数字，防止变成字符串相连
        avgHeight += Number(json.tree[i].height);
        avgGuanfu += json.tree[i].guanfu;
        totaloutput += json.tree[i].guanfu * json.tree[i].guanfu * 0.099 + json.tree[i].guanfu * 1.211 + 6.766;
      }
      avgHeight = avgHeight / n;
      avgGuanfu = avgGuanfu / n;
      setT_elevation(json.center.elevation.toFixed(2));
      setT_Height(avgHeight.toFixed(2));
      setT_guanfu(avgGuanfu.toFixed(2));
      setT_output(totaloutput.toFixed(2));
      // guanfu * guanfu * 0.099 + guanfu * 1.211 + 6.766

    });
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZTQ0NzU5MS0wMzUzLTQ2MmItYjBjNC0yYjYzMTk2YTlhYTkiLCJpZCI6Nzk3OTYsImlhdCI6MTY0MzI3MzQ3MH0.lrdjEm7yghHeZFsUd8kNl1dYnwSoKVGWEik9OBltwro';
    //加载地图后再添加模型最后添加树木信息
    const loadCesium = () => {
      //加载主函数，先加载Cesium，后加载模型b3dm，最后添加树木信息json文件
      creatCesium().then(loadModel).then(treeFunction);
    }
    loadCesium();
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
export default cesium;
