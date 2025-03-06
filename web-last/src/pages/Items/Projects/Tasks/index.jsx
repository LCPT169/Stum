import React, {useState, useRef} from 'react';
import {Button, Menu, Dropdown, message, Upload, Popconfirm, Tooltip, Image} from 'antd';
import ProTable from '@ant-design/pro-table';
import {ModalForm, ProFormText} from '@ant-design/pro-form';
import {history} from 'umi';
import styles from './style.less';
import {InboxOutlined} from '@ant-design/icons';
import {
  getTasks,
  uploadImages,
  cancelTask,
  removeTask,
  resatrtTask,
  downloadOrthophoto,
  downloadDSM, postId, startTask,
  runTaskPath, getRid, downloadPC, detectTreeJava, scanTreePython, downloadDetected
} from '@/services/ant-design-pro/api';
import {
  LoadingOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  FileImageOutlined,
  DotChartOutlined,
  CodeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  TableOutlined,
  MenuOutlined, ScanOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import {Radio} from 'antd';


const {Dragger} = Upload;


const options = {
  restart: '重启',
  cancel: '取消',
  remove: '删除',
  detect: '检测',
  downloadDetected: '下载检测图'
};
let dsm = 1;
let pc_quality;
const handleOptions = async (projectId, e, key) => {
  const taskId = e.id;
  const hide = message.loading(`正在${options[key]}任务`);
  try {
    if (key === 'restart') {
      const msg = await getRid({'tid': taskId});
      const path = await runTaskPath();
      await resatrtTask({
        'rid': msg.rid,
        'tid': taskId,
        'outputRoot': path.outputRoot,
      });
    }
    if (key === 'cancel') {
      await cancelTask({'tid': taskId});
    }
    if (key === 'remove') {
      await removeTask({'tid': taskId});
    }
    if (key === 'detect') {
      const msg = await getRid({'tid': taskId});
      const obj = await detectTreeJava();
      obj['rid'] = msg.rid;
      await scanTreePython(obj)
    }
    if (key === 'downloadDetected') {
      let uri = "/api/odmoutput/"
      const msg = await getRid({'tid': taskId});
      // await downloadDetected({'rid': msg.rid});
      uri += msg.rid + "/odm_orthophoto.tif"
      window.open(uri);
    }
    hide();
    message.success(`${options[key]}任务成功`);
    return true;
  } catch (error) {
    hide();
    message.error(`${options[key]}任务失败`);
    return false;
  }
};

const handleAdd = async (fields) => {
  let formdata = new FormData();
  for (let i = 0; i < imageList.length; i++) {
    formdata.append('uploadFile', imageList[i])
  }
  const hide = message.loading('正在创建任务');
  try {
    const rid = await postId({'uid': localStorage.getItem('uid')});
    formdata.append('rid', rid);
    await uploadImages(formdata, {"Accept": "*/*"});
    let path = await runTaskPath();
    const body = {};
    body['rid'] = rid;
    //tid不是在前端生成的，而应该在后端中生成唯一一个；
    // body['tid'] = "6c95f417-a2ab-4ff8-9f63-fdca9797bc1e";
    body['pid'] = history.location.query.id;
    body["tname"]=fields.name;
    body["repoRoot"] = path.repoRoot;
    body['outputRoot'] = path.outputRoot
    body["dsm"] = "True"
    body["pc-quality"] = "high";
    await startTask(body);
    // await addTask(history.location.query.id, formdata);
    hide();
    message.success('创建任务成功');
    return true;
  } catch (error) {
    hide();
    message.error('创建任务失败');
    return false;
  }
};
const props = {
  name: 'uploadFile',
  multiple: true,
  action: (i) => {
    imageList.push(i);
  },
  onChange(info) {
    const {status} = info.file;
    if (status !== 'uploading') {
      console.log("uploading——info.file, info.fileList",info.file, info.fileList);
    }
    if (status === 'done') {
      //message.success(`${info.file.name} 文件上传成功`);
    } else if (status === 'error') {
      message.error(`${info.file.name}文件上传失败`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const handleDownload = async (projectId, taskId, key) => {
  const hide = message.loading(`正在下载${key}`);
  try {
    let uri = "/api/odmoutput/"
    const msgg = await getRid({'tid': taskId});
    if (key === 'orthophoto') {
      // const msg = await downloadOrthophoto({'rid': msgg.rid});
      uri += msgg.rid + "/odm_orthophoto/odm_orthophoto.tif"
      window.open(uri);//msg.url
    } else if (key === 'dsm') {
      // const msg = await downloadDSM({'rid': msgg.rid});
      uri += msgg.rid + "/odm_dem/dsm.tif"
      window.open(uri);
    } else if (key === 'pc') {
      // const msg = await downloadPC({'rid': msgg.rid});
      uri += msgg.rid + "/odm_texturing/Batchedodm_textured_model_geo/odm_textured_model_geo.b3dm"
      window.open(uri);
    }
    hide();
    message.success(`正在下载${key}`);
    return true;
  } catch (error) {
    hide();
    message.error(`下载${key}失败`);
    return false;
  }
};

const handleCesium = async (record) => {
  try {
    const msg = await getRid({'tid': record.id});
    localStorage.setItem("rid", msg.rid);
    localStorage.setItem("name", record.name);
    history.push('/cesium');
  } catch (error) {
    return false;
  }
};


const menu = (
  <Menu key="tmsLayer" onClick={handleMenuClick}>
    <Menu.Item key="orthophoto" icon={<FileImageOutlined/>}>
      下载Orthophoto(正射影像图)
    </Menu.Item>
    <Menu.Item key="dsm" icon={<FileImageOutlined/>}>
      下载DSM(数字地面模型)
    </Menu.Item>
    <Menu.Item key="pc" icon={<FileImageOutlined/>}>
      下载Points_Cloud(三维点云)
    </Menu.Item>
  </Menu>
);

function handleMenuClick(e) {
  // message.info('Click on menu item.');
  handleDownload(history.location.query.id, selectedRow.id, e.key);
}

// 新建任务的图片数据
let imageList = [];
// 应用于文件下载的被选中任务变量
let selectedRow = {};

export default () => {
  const formRef = useRef();
  const [time, setTime] = useState(() => Date.now());
  // 新建任务弹窗变量
  const [createModalVisible, handleModalVisible] = useState(false);
  // 查看任务对应图片弹窗变量
  const [getImagesModalVisible, handleGetImagesModalVisible] = useState(false);
  // 轮询变量
  const [polling, setPolling] = useState(5000);
  // 设置图片大小变量
  const [imageSize, setImageSize] = useState('small');
  // 表格数据处理
  const actionRef = useRef();
  const confirm = async (e, key) => {
    const success = await handleOptions(history.location.query.id, e, key);
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };
  const columns = [
    {
      title: '任务名',
      key: 'id',
      render: (record) => <span>{record.name === null ? 'Task #' + record.id : record.name}</span>,
    },
    // {
    //   title: '创建时间',
    //   key: 'created_at',
    //   dataIndex: 'created_at',
    //   valueType: 'dateTime',
    // },
    {
      title: '图片数量',
      key: 'images_count',
      dataIndex: 'images_count',
      render: (text) => (
        <a
          onClick={() => {
            handleGetImagesModalVisible(true);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      filters: true,
      onFilter: true,
      valueEnum: {
        "TaskStatus.QUEUEING": {text: '排队中', status: 'Default'},
        "TaskStatus.RUNNING": {text: '运行中', status: 'Processing'},
        "TaskStatus.FAILED": {text: '失败', status: 'Error'},
        "TaskStatus.COMPLETED": {text: '已完成', status: 'Success'},
        "TaskStatus.CANCELED": {text: '取消', status: 'Default'},
      },
    },
    {
      title: '进度',
      key: 'progress',
      dataIndex: 'running_progress',
      valueType: (item) => ({
        type: 'progress',
        status: 'active'// item.status //!== 'error' ? 'active' : 'exception',
      }),
    },
    {
      title: '操作',
      key: 'option',
      //fixed: 'right',
      render: (record) => [
        <Popconfirm
          key="restart"
          title="确定重启此任务吗"
          placement="bottom"
          onConfirm={() => {
            confirm(record, 'restart');
          }}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title="重启任务">
            <Button type="primary" ghost shape="circle" icon={<PlayCircleOutlined/>}/>
          </Tooltip>
        </Popconfirm>,
        <Popconfirm
          key="cancel"
          title="确定取消此任务吗"
          placement="bottom"
          onConfirm={() => {
            confirm(record, 'cancel');
          }}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title="取消任务">
            <Button shape="circle" icon={<PauseCircleOutlined/>}/>
          </Tooltip>
        </Popconfirm>,
        <Popconfirm
          key="remove"
          title="确定删除此任务吗"
          placement="bottom"
          onConfirm={() => {
            confirm(record, 'remove');
          }}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title="删除任务">
            <Button shape="circle" icon={<DeleteOutlined/>}/>
          </Tooltip>
        </Popconfirm>
      ],
    },
    {
      title: '检测树木',
      key: 'option',
      //fixed: 'right',
      render: (record) => [
        <Popconfirm
          key="detect"
          title="确定检测此任务吗"
          placement="bottom"
          onConfirm={() => {
            confirm(record, 'detect');
          }}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title="检测树木">
            <Button shape="circle" icon={<ScanOutlined/>}/>
          </Tooltip>
        </Popconfirm>,
        <Popconfirm
          key="downloadDetected"
          title="确定下载检测图吗"
          placement="bottom"
          onConfirm={() => {
            confirm(record, 'downloadDetected');
          }}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title="下载检测图">
            <Button shape="circle" icon={<DotChartOutlined/>}/>
          </Tooltip>
        </Popconfirm>,
      ],
    },
    {
      title: '文件下载',
      key: 'file',
      render: (record) => [
        <Dropdown
          key="downloadFile"
          overlay={menu}
          trigger={['click']}
          disabled={false}//{record.running_progress !== '100.0'}//}
        >
          <Button
            icon={<DownloadOutlined/>}
            onClick={() => {
              selectedRow = record;
            }}
          >
            <DownOutlined/>
          </Button>
        </Dropdown>,
      ],
    },
    {
      title: '三维模型',
      key: '3d',
      //fixed: 'right',
      render: (record) => [
        <Button
          key="viewModel"
          type="primary"
          ghost
          shape="circle"
          icon={<PictureOutlined/>}
          //         () => {
          //   // localStorage.setItem("rid","sad")
          //   // history.push('/cesium');
          // }
          onClick={() => {
            handleCesium(record)
          }}
        />,
      ],
    },
  ];
  return (
    <>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        rowKey="key"
        search={false}
        pagination={{
          showSizeChanger: true,
        }}
        polling={polling || undefined}
        request={async () => {
          const msgg = await getTasks({'pid': history.location.query.id});
          setTime(Date.now());
          msgg.forEach((element) => {
            element.running_progress = element.running_progress.toFixed(1);
          });
          return {
            data: msgg,
            success: true,
            total: msgg.length,
          };
        }}
        dateFormatter="string"
        headerTitle={`上次更新时间：${moment(time).format('HH:mm:ss')}`}
        toolBarRender={() => [
          <Button
            key="polling"
            type="primary"
            onClick={() => {
              if (polling) {
                setPolling(undefined);
                return;
              }
              setPolling(5000);
            }}
          >
            {polling ? <LoadingOutlined/> : <ReloadOutlined/>}
            {polling ? '停止轮询' : '开始轮询'}
          </Button>,
          <Button
            key="create"
            icon={<PlusOutlined/>}
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
      />
      <ModalForm
        formRef={formRef}
        className={styles.modelForm}
        title={'新建任务'}
        width="720px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd({...value});
          // 重置表单
          formRef.current?.resetFields();
          imageList = [];
          if (success) {
            if (actionRef.current) {
              actionRef.current?.reload();
              // actionRef.current.reload();
            }
            handleModalVisible(false);
          }
        }}
        modalProps={{
          onCancel: (e) => {
            // 重置表单
            formRef.current?.resetFields();
            imageList = [];
          },
        }}
      >
        <ProFormText
          label="任务名"
          tooltip=""
          placeholder="请输入任务名"
          rules={[
            {
              required: true,
              message: '规则名称为必填项',
            },
          ]}
          name="name"
        />
        <>ODM参数：
          <br/><br/>
          DSM开关：
          <Radio.Group onChange={(e) => {
            dsm = e.target.value;
          }} defaultValue="1">
            <Radio.Button value="1">开启</Radio.Button>
            <Radio.Button value="0">关闭</Radio.Button>
          </Radio.Group>
          <br/>
          模型质量：
          <Radio.Group onChange={(e) => {
            pc_quality = e.target.value;
          }} defaultValue="Medium" style={{marginTop: 16}}>
            <Radio.Button value="Highest">Highest</Radio.Button>{/*ultra*/}
            {/*<Radio.Button value="b" disabled>Shanghai </Radio.Button>*/}
            <Radio.Button value="High">High</Radio.Button>
            <Radio.Button value="Medium">Medium</Radio.Button>
            <Radio.Button value="Low">Low</Radio.Button>
            <Radio.Button value="Lowest">Lowest</Radio.Button>
          </Radio.Group>
          <br/>
        </>
        <br/><br/>
        <div style={{marginBottom: '20px'}}>
          图片
          {/*<span style={{float: 'right'}}>
            <a
              onClick={() => {
                setImageSize('small');
              }}
            >
              <MenuOutlined style={{fontSize: '18px', color: '#08c'}}/>
            </a>
            <a
              onClick={() => {
                setImageSize('default');
              }}
            >
              <AppstoreOutlined style={{fontSize: '20px', color: '#08c'}}/>
            </a>
            <a
              onClick={() => {
                setImageSize('large');
              }}
            >
              <TableOutlined style={{fontSize: '20px', color: '#08c'}}/>
            </a>
          </span>*/}
        </div>
        {/*<Upload*/}
        {/*  // action={(i) => {*/}
        {/*  //   imageList.push(i)*/}
        {/*  // }}*/}
        {/*  multiple*/}
        {/*  defaultFileList={[]}*/}
        {/*  onRemove={(e) => {*/}
        {/*    for (let i = 0; i < imageList.length; i++) {*/}
        {/*      if (e.uid === imageList[i].uid) {*/}
        {/*        imageList.splice(i, 1);*/}
        {/*      }*/}
        {/*    }*/}
        {/*  }}*/}
        {/*></Upload>*/}
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined/>
          </p>
          <p className="ant-upload-text">点击或拖动进行上传</p>
          <p className="ant-upload-hint">
            支持无人机影像图(格式:PNG,JPG,JPEG)
          </p>
        </Dragger>


      </ModalForm>
      {/*<ModalForm
        className={styles.modelForm}
        title={'查看任务图片'}
        width="720px"
        submitter={false}
        visible={getImagesModalVisible}
        onVisibleChange={handleGetImagesModalVisible}
      >
        <div style={{marginBottom: '20px'}}>
          <PictureOutlined style={{fontSize: '18px', color: '#08c', verticalAlign: 'sub'}}/>
          <span>&nbsp;任务图片如下:</span>
          <span style={{float: 'right'}}>
            <a
              onClick={() => {
                setImageSize('small');
              }}
            >
              <MenuOutlined style={{fontSize: '18px', color: '#08c'}}/>
            </a>
            <a
              onClick={() => {
                setImageSize('default');
              }}
            >
              <AppstoreOutlined style={{fontSize: '20px', color: '#08c'}}/>
            </a>
            <a
              onClick={() => {
                setImageSize('large');
              }}
            >
              <TableOutlined style={{fontSize: '20px', color: '#08c'}}/>
            </a>
          </span>
        </div>
        <Image.PreviewGroup>
          <div style={{border: '1px dashed', padding: '10px'}}>
            <Image
              width={imageSize === 'small' ? 60 : imageSize === 'default' ? 100 : 150}
              src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
            />
            <Image
              width={imageSize === 'small' ? 60 : imageSize === 'default' ? 100 : 150}
              src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
            />
            <Image
              width={imageSize === 'small' ? 60 : imageSize === 'default' ? 100 : 150}
              src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
            />
            <Image
              width={imageSize === 'small' ? 60 : imageSize === 'default' ? 100 : 150}
              src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
            />
          </div>
        </Image.PreviewGroup>
      </ModalForm>*/}
    </>);
};
