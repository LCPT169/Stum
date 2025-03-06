/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target:'http://localhost:8080',
      // target: 'http://115.227.21.8:9000',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    },
    '/apipy/': {
      target:'http://localhost:8080',
      changeOrigin: false,
    },
    '/apiyolo/': {
      // 要代理的地址
      target:'http://localhost:8080',
      changeOrigin: false,
    }
  },
  test: {
    '/api/': {
      // 要代理的地址
      target: 'http://localhost:8080',
      //target: 'http://192.168.1.106:8080',
      //target: 'http://115.227.21.8:9000',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    },
    '/apipy/': {
      // 要代理的地址
      target:'http://localhost:8080',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    },
    '/apiyolo/': {
      // 要代理的地址
      //target: 'http://localhost:8000',
      //target: 'http://192.168.1.106:5100',
      target:'http://localhost:8080',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    }
  },
  pre: {
    '/api/': {
      // 要代理的地址
      //target: 'http://localhost:8000',
      //target: 'http://192.168.1.106:8080',
      target:'http://localhost:8080',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    },
    '/apipy/': {
      // 要代理的地址
      target: 'http://localhost:8080',
      //target: 'http://192.168.1.106:5000',
      //target: 'http://115.227.21.8:5000',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    },
    '/apiyolo/': {
      // 要代理的地址
      //target: 'http://localhost:8000',
      //target: 'http://192.168.1.106:5100',
      target:'http://localhost:8080',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: false,
    }
  },
};
