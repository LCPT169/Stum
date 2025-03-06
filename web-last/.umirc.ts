import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  webpack5: {
    // 启用 webpack 5
    lazyCompilation: false,
  },
  mfsu: false, // 临时关闭 mfsu 以排查问题
  // 其他配置保持不变
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    name: 'Ant Design Pro',
    locale: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          path: '/user/login',
          layout: false,
          name: 'login',
          component: './user/Login',
        },
      ],
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: './Welcome',
    },
    {
      path: '/',
      redirect: '/welcome',
    },
  ],
});
