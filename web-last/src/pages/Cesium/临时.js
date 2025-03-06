import axios from "axios";
import Cesium from "cesium";
import {getTreeDataApi} from "@/services/ant-design-pro/api";

var tileset = new Cesium.Cesium3DTileset({
  url: Cesium.IonResource.fromAssetId(75343),
});
viewer.scene.primitives.add(tileset);


// HTML overlay for showing feature name on mouseover
var nameOverlay = document.createElement("div");
viewer.container.appendChild(nameOverlay);
nameOverlay.className = "backdrop";
nameOverlay.style.display = "none";
nameOverlay.style.position = "absolute";
nameOverlay.style.bottom = "0";
nameOverlay.style.left = "0";
nameOverlay.style["pointer-events"] = "none";
nameOverlay.style.padding = "4px";
nameOverlay.style.backgroundColor = "black";


// Information about the currently selected feature
var selected = {
  feature: undefined,
  originalColor: new Cesium.Color(),
};

// An entity object which will hold info about the currently selected feature for infobox display
var selectedEntity = new Cesium.Entity();




// 获取默认的左键单击处理程序，用于在左键单击时未拾取要素
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(
  Cesium.ScreenSpaceEventType.LEFT_CLICK
);

// 如果支持剪影，则鼠标上方的剪影功能为蓝色，鼠标单击的剪影功能为绿色
// 如果不支持轮廓，请将特征颜色更改为鼠标悬停时为黄色，单击鼠标时为绿色
if (
  Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)
) {
// 支持轮廓
  var silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
  silhouetteBlue.uniforms.color = Cesium.Color.BLUE;//蓝色
  silhouetteBlue.uniforms.length = 0.01;
  silhouetteBlue.selected = [];

  var silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
  silhouetteGreen.uniforms.color = Cesium.Color.LIME;
  silhouetteGreen.uniforms.length = 0.01;
  silhouetteGreen.selected = [];

  viewer.scene.postProcessStages.add(
    Cesium.PostProcessStageLibrary.createSilhouetteStage([
      silhouetteBlue,
      silhouetteGreen,
    ])
  );

// 在悬停时勾勒出蓝色的轮廓
  viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
// 如果先前高亮显示了某个要素，请撤消该高亮显示
      silhouetteBlue.selected = [];

//点击新要素
      var pickedFeature = viewer.scene.pick(movement.endPosition);
      if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = "none";
        return;
      }

//要素被点击，显示它的覆盖内容
      nameOverlay.style.display = "block";
      nameOverlay.style.bottom =
        viewer.canvas.clientHeight - movement.endPosition.y + "px";
      nameOverlay.style.left = movement.endPosition.x + "px";
      var name = pickedFeature.getProperty("BIN");
      nameOverlay.textContent = name;

// 突出显示尚未选定的功能
      if (pickedFeature !== selected.feature) {
        silhouetteBlue.selected = [pickedFeature];
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// 在信息框中显示选定内容和元数据
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
      movement
    ) {
// 如果先前选择了某个特征，请撤消高亮显示
      silhouetteGreen.selected = [];

// 点击新要素
      var pickedFeature = viewer.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
      }

// Select the feature if it's not already selected
      if (silhouetteGreen.selected[0] === pickedFeature) {
        return;
      }

// 保存选定要素的原始颜色
      var highlightedFeature = silhouetteBlue.selected[0];
      if (pickedFeature === highlightedFeature) {
        silhouetteBlue.selected = [];
      }

// 高亮新选择要素
      silhouetteGreen.selected = [pickedFeature];

// 设置要素信息框描述
      var featureName = pickedFeature.getProperty("name");
      selectedEntity.name = featureName;
      selectedEntity.description =
        'Loading <div class="cesium-infoBox-loading"></div>';
      viewer.selectedEntity = selectedEntity;
      selectedEntity.description =
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>BIN</th><td>" +
        pickedFeature.getProperty("BIN") +
        "</td></tr>" +
        "<tr><th>DOITT ID</th><td>" +
        pickedFeature.getProperty("DOITT_ID") +
        "</td></tr>" +
        "<tr><th>SOURCE ID</th><td>" +
        pickedFeature.getProperty("SOURCE_ID") +
        "</td></tr>" +
        "</tbody></table>";
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
} else {
// 不支持轮廓。相反，更改特征颜色
// 有关当前突出显示的功能的信息
  var highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color(),
  };

// 鼠标移动显示黄色
  viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
// 如果先前高亮显示了某个要素，请撤消该高亮显示
      if (Cesium.defined(highlighted.feature)) {
        highlighted.feature.color = highlighted.originalColor;
        highlighted.feature = undefined;
      }
// 点击新要素
      var pickedFeature = viewer.scene.pick(movement.endPosition);
      if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = "none";
        return;
      }
// 要素被点击，显示它的覆盖内容
      nameOverlay.style.display = "block";
      nameOverlay.style.bottom =
        viewer.canvas.clientHeight - movement.endPosition.y + "px";
      nameOverlay.style.left = movement.endPosition.x + "px";
      var name = pickedFeature.getProperty("name");
      if (!Cesium.defined(name)) {
        name = pickedFeature.getProperty("id");
      }
      nameOverlay.textContent = name;
// Highlight the feature if it's not already selected.
      if (pickedFeature !== selected.feature) {
        highlighted.feature = pickedFeature;
        Cesium.Color.clone(
          pickedFeature.color,
          highlighted.originalColor
        );
        pickedFeature.color = Cesium.Color.YELLOW;
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//为所选内容上色并在信息框中显示元数据
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
      movement
    ) {
// 如果先前选择了某个特征，请撤消高亮显示
      if (Cesium.defined(selected.feature)) {
        selected.feature.color = selected.originalColor;
        selected.feature = undefined;
      }
// 点击新要素
      var pickedFeature = viewer.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
      }
// Select the feature if it's not already selected
      if (selected.feature === pickedFeature) {
        return;
      }
      selected.feature = pickedFeature;
// Save the selected feature's original color
      if (pickedFeature === highlighted.feature) {
        Cesium.Color.clone(
          highlighted.originalColor,
          selected.originalColor
        );
        highlighted.feature = undefined;
      } else {
        Cesium.Color.clone(pickedFeature.color, selected.originalColor);
      }
// Highlight newly selected feature
      pickedFeature.color = Cesium.Color.LIME;
// Set feature infobox description
      var featureName = pickedFeature.getProperty("name");
      selectedEntity.name = featureName;
      selectedEntity.description =
        'Loading <div class="cesium-infoBox-loading"></div>';
      viewer.selectedEntity = selectedEntity;
      selectedEntity.description =
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>BIN</th><td>" +
        pickedFeature.getProperty("BIN") +
        "</td></tr>" +
        "<tr><th>DOITT ID</th><td>" +
        pickedFeature.getProperty("DOITT_ID") +
        "</td></tr>" +
        "<tr><th>SOURCE ID</th><td>" +
        pickedFeature.getProperty("SOURCE_ID") +
        "</td></tr>" +
        "<tr><th>Longitude</th><td>" +
        pickedFeature.getProperty("longitude") +
        "</td></tr>" +
        "<tr><th>Latitude</th><td>" +
        pickedFeature.getProperty("latitude") +
        "</td></tr>" +
        "<tr><th>Height</th><td>" +
        pickedFeature.getProperty("height") +
        "</td></tr>" +
        "<tr><th>Terrain Height (Ellipsoid)</th><td>" +
        pickedFeature.getProperty("TerrainHeight") +
        "</td></tr>" +
        "</tbody></table>";
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);}

//
//提取树木检测数据并添加颜色
const getTreeData = () => {
  const api = 'http://localhost:8001/tree_coordinate.json';
  axios.get(api)
    .then((response) => {
      //handleTreeData(response.data.tree);
      treeData = response.data.tree;
      //单体化处理
      for (let i = 0; i < treeData.length; i++) {
        let topLongitude = parseFloat(treeData[i].top_longitude);
        let topLatitude = parseFloat(treeData[i].top_latitude);
        let butLogitude = parseFloat(treeData[i].but_longitude);
        let butLatitude = parseFloat(treeData[i].but_latitude);
        let treeHeight = parseFloat(treeData[i].height);
        let name = treeData[i].name;
        let width = treeData[i].width;


        let obj = {
          id: "volume" + i,
          name: name,
          longitude: (topLongitude + butLogitude) / 2,
          latitude: (topLatitude + butLatitude) / 2,
          height: treeHeight,
          width: width
        };
        let center = new Cesium.Cartesian3.fromDegrees(
          (topLongitude + butLogitude) / 2,
          (topLatitude + butLatitude) / 2,
          modelLocation.height);
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
                  treeHeight * 2 / 3),
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
    })
    .catch(error => {
      // 报错
      console.log("未获取树木数据");
    });
};
let treeData = [
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 13.76,
    "top_latitude": "30.231308206206833",
    "top_longitude": "119.67998467901329",
    "but_latitude": "30.231226204561537",
    "but_longitude": "119.68009201732762"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 14.37,
    "top_latitude": "30.23132523577394",
    "top_longitude": "119.67979145689574",
    "but_latitude": "30.231246165619552",
    "but_longitude": "119.6799097794287"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 11.62,
    "top_latitude": "30.231588464427777",
    "top_longitude": "119.67928868513226",
    "but_latitude": "30.231520751237877",
    "but_longitude": "119.67938083420583"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 11.71,
    "top_latitude": "30.231676697539832",
    "top_longitude": "119.67867834900727",
    "but_latitude": "30.23160984353625",
    "but_longitude": "119.67877259896065"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "14",
    "width": 11.5,
    "top_latitude": "30.231416675131822",
    "top_longitude": "119.67911266742844",
    "but_latitude": "30.231348993920115",
    "but_longitude": "119.67920325956251"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 11.91,
    "top_latitude": "30.231466124788362",
    "top_longitude": "119.67881127946363",
    "but_latitude": "30.231390825607555",
    "but_longitude": "119.67889958813454"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 14.51,
    "top_latitude": "30.231393968932405",
    "top_longitude": "119.67929690841848",
    "but_latitude": "30.23130778476335",
    "but_longitude": "119.67941036505991"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 11.08,
    "top_latitude": "30.23137271724886",
    "top_longitude": "119.67941004998785",
    "but_latitude": "30.23130957395291",
    "but_longitude": "119.67949920722829"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 10.55,
    "top_latitude": "30.231308898065322",
    "top_longitude": "119.67990680866865",
    "but_latitude": "30.23124413250854",
    "but_longitude": "119.67998709406001"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 13.17,
    "top_latitude": "30.23145112445923",
    "top_longitude": "119.67890537815894",
    "but_latitude": "30.231373264200727",
    "but_longitude": "119.67900867583604"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 15.22,
    "top_latitude": "30.23153413155687",
    "top_longitude": "119.6783961568413",
    "but_latitude": "30.2314459863853",
    "but_longitude": "119.67851735019653"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "10",
    "width": 11.2,
    "top_latitude": "30.231483108023014",
    "top_longitude": "119.67870840707575",
    "but_latitude": "30.231415952010128",
    "but_longitude": "119.67879537897682"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 11.31,
    "top_latitude": "30.231512021840825",
    "top_longitude": "119.67850719848069",
    "but_latitude": "30.231446604761114",
    "but_longitude": "119.6785973332935"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 10.14,
    "top_latitude": "30.231611446691016",
    "top_longitude": "119.67909095044246",
    "but_latitude": "30.23155076906985",
    "but_longitude": "119.67916978975973"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 10.53,
    "top_latitude": "30.231690451998624",
    "top_longitude": "119.67857902362755",
    "but_latitude": "30.231627457842727",
    "but_longitude": "119.67866091606922"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 10.9,
    "top_latitude": "30.23125225396701",
    "top_longitude": "119.68029523594917",
    "but_latitude": "30.231190483226648",
    "but_longitude": "119.68038339122535"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "14",
    "width": 11.13,
    "top_latitude": "30.231535625662247",
    "top_longitude": "119.67960140496251",
    "but_latitude": "30.231471140980666",
    "but_longitude": "119.6796900065476"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 10.65,
    "top_latitude": "30.231569508338218",
    "top_longitude": "119.67939981216695",
    "but_latitude": "30.231510903147075",
    "but_longitude": "119.67948753494439"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "10",
    "width": 10.83,
    "top_latitude": "30.23165933800496",
    "top_longitude": "119.67877757655195",
    "but_latitude": "30.231595818792837",
    "but_longitude": "119.67886308942882"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 10.61,
    "top_latitude": "30.231361538506846",
    "top_longitude": "119.67951567593136",
    "but_latitude": "30.23130427450735",
    "but_longitude": "119.67960395411772"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 10.67,
    "top_latitude": "30.23163912601289",
    "top_longitude": "119.67888399634862",
    "but_latitude": "30.23157963051242",
    "but_longitude": "119.67897117609232"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "15",
    "width": 9.96,
    "top_latitude": "30.23144991152245",
    "top_longitude": "119.68022063498806",
    "but_latitude": "30.231392377020054",
    "but_longitude": "119.68030007803162"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 12.0,
    "top_latitude": "30.23152593668945",
    "top_longitude": "119.67970032107353",
    "but_latitude": "30.2314550263745",
    "but_longitude": "119.67979446007195"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 10.81,
    "top_latitude": "30.231620244578398",
    "top_longitude": "119.67899149072271",
    "but_latitude": "30.23155055450938",
    "but_longitude": "119.67907008558318"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "18",
    "width": 12.12,
    "top_latitude": "30.231596779984436",
    "top_longitude": "119.67919077016136",
    "but_latitude": "30.231524067510158",
    "but_longitude": "119.67928486070919"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 11.91,
    "top_latitude": "30.231432317338715",
    "top_longitude": "119.67900923951031",
    "but_latitude": "30.231369841965062",
    "but_longitude": "119.6791098389443"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 9.43,
    "top_latitude": "30.231722557668494",
    "top_longitude": "119.67835401503231",
    "but_latitude": "30.23166826351926",
    "but_longitude": "119.67842939322674"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "11",
    "width": 9.92,
    "top_latitude": "30.231438440835785",
    "top_longitude": "119.68031846404087",
    "but_latitude": "30.23138622879404",
    "but_longitude": "119.68040220558541"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 12.66,
    "top_latitude": "30.231342407722497",
    "top_longitude": "119.6796132971312",
    "but_latitude": "30.231274418214603",
    "but_longitude": "119.67971893903186"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "13",
    "width": 12.41,
    "top_latitude": "30.23155246084757",
    "top_longitude": "119.67950579832532",
    "but_latitude": "30.23147790318525",
    "but_longitude": "119.67960191556216"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 8.62,
    "top_latitude": "30.231501683535974",
    "top_longitude": "119.67982792055969",
    "but_latitude": "30.23145026227376",
    "but_longitude": "119.67989506752399"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "12",
    "width": 11.5,
    "top_latitude": "30.231712895646567",
    "top_longitude": "119.67847370276371",
    "but_latitude": "30.231646985492493",
    "but_longitude": "119.67856590144892"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "14",
    "width": 11.32,
    "top_latitude": "30.2315553177364",
    "top_longitude": "119.67833026593127",
    "but_latitude": "30.231478439261263",
    "but_longitude": "119.67840762771971"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "10",
    "width": 9.26,
    "top_latitude": "30.231490081881546",
    "top_longitude": "119.6786099364779",
    "but_latitude": "30.231437160709945",
    "but_longitude": "119.67868431307872"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "14",
    "width": 13.87,
    "top_latitude": "30.231555976958195",
    "top_longitude": "119.68010512226097",
    "but_latitude": "30.231484127139232",
    "but_longitude": "119.68022312151545"
  },
  {
    "name": "cinnamomum_camphora",
    "height": "14",
    "width": 12.29,
    "top_latitude": "30.2314111589552",
    "top_longitude": "119.67920598483461",
    "but_latitude": "30.231343265319335",
    "but_longitude": "119.67930695635502"
  }
]
//相机位置
NEW
let CameraLocation = {
  longitude: 119.013326,
  latitude: 30.081411,
  height: 1000,
  heading: 10,
  pitch: -60,
  roll: 0.025883251314954971306
}
//初始位置，方向
NEW
let ModelLocation = {
  longitude: 119.013326, //经度
  latitude: 30.081411, //纬度
  height: 88.2,       //高度
  rx: -87.8,    //X轴|Roll
  ry: 1,     //Y轴|Heading
  rz: -0.7,      //Z轴|Pitch
  scale: 1
}

let viewer = 1;
let tileset = 1;
if (viewer === 1) {
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
    baseLayerPicker: true,
    // 加载高德影像地图
    //imageryProvider: new Cesium.UrlTemplateImageryProvider({url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",}),
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
if (tileset === 1) {
  //等待高程加载
  // await waitForHeight(modelLocation.longitude, modelLocation.latitude).then(height => {
  //   copyoriginModelAltitude = height
  //   modelAltitude = height + parseFloat(modifyData.daltitude);
  //   originModelAltitude = modelAltitude;
  // });
  //加载3D模型
  tileset = new Cesium.Cesium3DTileset({
    url: 'http://localhost:8001/Last-data/tileset.json',
    //maximumScreenSpaceError: 2, //最大的屏幕空间误差
    //maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
  });
  //添加到场景
  tileset.readyPromise.then(viewer.scene.primitives.add(tileset));
  //更新模型数据
  tileset.readyPromise.then((tileset) => {
    update3DTiles(modelLocation);
    //viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
  });
}



//初始位置，方向
let lastestmodelLocation = {
  longitude: 119.67952, //经度
  latitude: 30.23144, //纬度
  height: 88.2,       //高度
  rx: -87.8,    //X轴|Roll
  ry: 1,     //Y轴|Heading
  rz: -0.7,      //Z轴|Pitch
  scale: 1
}
let lastestcameraLocation = {
  longitude: 119.679462,
  latitude: 30.230264,
  height: 314.562799425431,
  heading: 10,
  pitch: -60,
  roll: 0.025883251314954971306
}
let lastmodelLocation = {
  longitude: 119.013776, //经度
  latitude: 30.081111, //纬度
  height: 55.4,       //高度
  rx: -87.8,    //X轴|Roll|0
  ry: 1,     //Y轴|Heading|176.46
  rz: -0.7,      //Z轴|Pitch|-59.13
  scale: 1
}
//相机位置
let lastcameraLocation = {
  longitude: 119.014183,
  latitude: 30.079087,
  height: 1000,
  heading: 345,//10
  pitch: -59.13,//-60
  roll: 0//0.025883251314954971306
}

//获取模型位置以及树木检测数据(treeDataJson)
const getTreeData = async () => {
  try {
    const treeDataJson = await getTreeDataApi();
    console.log("树木信息：", treeDataJson.tree);
    return treeDataJson.tree;
  } catch (error) {
    console.log("获取树木信息失败");
  }
}


//获取地形高度
let getHeightByType = (cartesian) => {
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
const cartesian = new Cesium.Cartesian3.fromDegrees(119.013776, 30.081111)
getHeightByType([cartesian]).then(results => {
  console.log('demo: 拾取结果：', results)
})