import React, {useEffect, useState} from 'react';
import {StatisticCard} from '@ant-design/pro-card';
import RcResizeObserver from 'rc-resize-observer';
import {getDashboard} from "@/services/ant-design-pro/api";

const {Statistic, Divider} = StatisticCard;

const Dashboard = () => {
  const [info, setInfo] = useState({})
  const [responsive, setResponsive] = useState(false);
  useEffect(async () => {
    await getDashboard().then((result) => {
      setInfo(result);
      // setInfo({
      //   "taskNumber": 10,
      //   "taskNotRunning": 5,
      //   "taskRunning": 3,
      //   "taskCompromised": 2,
      //   "taskCompleted": 4,
      //   "storageSpace": 601986875,
      //   "storageSpaceUsed": 1806062,
      //   "storageSpaceUnUsed": 3701928,
      //   "memorySpace": 601986875,
      //   "memorySpaceUsed": 1806062,
      //   "memorySpaceUnUsed": 3701928
      // })
    })
  }, []);
  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <StatisticCard.Group>
        <StatisticCard
          statistic={{
            title: '任务数量',
            tip: '帮助文字',
            value: info.taskNumber//10,
          }}
        />
        <Divider/>
        <StatisticCard
          statistic={{
            title: '未运行',
            value: info.taskNotRunning,//5,
            status: 'default',
          }}
        />
        <StatisticCard
          statistic={{
            title: '作业中',
            value: info.taskRunning,//3,
            status: 'processing',
          }}
        />
        <StatisticCard
          statistic={{
            title: '作业异常',
            value: info.taskCompromised,//2,
            status: 'error',
          }}
        />
        <StatisticCard
          statistic={{
            title: '已完成',
            value: info.taskCompleted,//'-',
            status: 'success',
          }}
        />
      </StatisticCard.Group>
      <StatisticCard.Group direction={responsive ? 'column' : 'row'} style={{marginTop: 8}}>
        <StatisticCard
          statistic={{
            title: '存储空间',
            tip: '这些值可能与运行应用程序的虚拟化环境相关，而不一定与机器的值相关。请参阅在Docker设置中更改这些值的Windows和MacOS说明。',
            value: Number(info.storageSpace).toFixed(2)+"GB",//601986875,
          }}
        />
        <Divider type={responsive ? 'horizontal' : 'vertical'}/>
        <StatisticCard
          statistic={{
            title: '未使用',
            value: Number(info.storageSpaceUnUsed).toFixed(2)+"GB",// 3701928,
            description: <Statistic title="占比" value={Math.round((info.storageSpaceUnUsed/info.storageSpace) * 10000) / 100 + '%'}/>,
          }}
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/ShNDpDTik/huan.svg"
              alt="百分比"
              width="100%"
            />
          }
          chartPlacement="left"
        />
        <StatisticCard
          statistic={{
            title: '已用',
            value: Number(info.storageSpaceUsed).toFixed(2)+"GB",//1806062,
            description: <Statistic title="占比" value={Math.round((info.storageSpaceUsed/info.storageSpace) * 10000) / 100 + '%'}/>,
          }}
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/6YR18tCxJ/huanlv.svg"
              alt="百分比"
              width="100%"
            />
          }
          chartPlacement="left"
        />
      </StatisticCard.Group>
      <StatisticCard.Group direction={responsive ? 'column' : 'row'} style={{marginTop: 8}}>
        <StatisticCard
          statistic={{
            title: '内存',
            tip: '这些值可能与运行应用程序的虚拟化环境相关，而不一定与机器的值相关。请参阅在Docker设置中更改这些值的Windows和MacOS说明。',
            value: Number(info.memorySpace).toFixed(2)+"GB",//601986875,
          }}
        />
        <Divider type={responsive ? 'horizontal' : 'vertical'}/>
        <StatisticCard
          statistic={{
            title: '未使用',
            value: Number(info.memorySpaceUnUsed).toFixed(2)+"GB",//3701928,
            description: <Statistic title="占比" value={Math.round((info.memorySpaceUnUsed/info.memorySpace) * 10000) / 100 + '%'}/>,
          }}
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/ShNDpDTik/huan.svg"
              alt="百分比"
              width="100%"
            />
          }
          chartPlacement="left"
        />
        <StatisticCard
          statistic={{
            title: '已用',
            value: Number(info.memorySpaceUsed).toFixed(2)+"GB",//1806062,
            description: <Statistic title="占比" value={Math.round((info.memorySpaceUsed/info.memorySpace) * 10000) / 100 + '%'}/>,
          }}
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/6YR18tCxJ/huanlv.svg"
              alt="百分比"
              width="100%"
            />
          }
          chartPlacement="left"
        />
      </StatisticCard.Group>
    </RcResizeObserver>
  );
};

export default Dashboard;
