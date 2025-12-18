'use strict'
const path = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = /\.(js|css|json|txt|ico|svg)(\?.*)?$/i

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = '' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 9528 // dev port

function wsProxyOnError(tag) {
  return function onError(err, req, res) {
    // Prevent unhandled ECONNRESET from crashing dev server
    // eslint-disable-next-line no-console
    console.log(`[devServer][proxy:${tag}] error:`, err && (err.code || err.message || err))
    try {
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' })
        res.end('WebSocket proxy error')
      }
    } catch (e) {
      /* ignore */
    }
  }
}

function wsProxyOnProxyReqWs(tag) {
  return function onProxyReqWs(proxyReq, req, socket) {
    // Swallow socket errors to avoid crashing the dev server when backend resets WS
    try {
      if (socket && socket.on) {
        socket.on('error', err => {
          // eslint-disable-next-line no-console
          console.log(
            `[devServer][proxy:${tag}] socket error:`,
            err && (err.code || err.message || err)
          )
        })
      }
      if (proxyReq && proxyReq.on) {
        proxyReq.on('error', err => {
          // eslint-disable-next-line no-console
          console.log(
            `[devServer][proxy:${tag}] proxyReq error:`,
            err && (err.code || err.message || err)
          )
        })
      }
    } catch (e) {
      // ignore
    }
  }
}

// Swallow common transient socket errors in dev to prevent crashes
if (process.env.NODE_ENV === 'development') {
  process.on('uncaughtException', err => {
    if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
      // eslint-disable-next-line no-console
      console.log('[devServer] uncaughtException swallowed:', err.code)
      return
    }
    // Re-throw other errors
    throw err
  })
  process.on('unhandledRejection', reason => {
    const code = reason && reason.code
    if (code === 'ECONNRESET' || code === 'EPIPE') {
      // eslint-disable-next-line no-console
      console.log('[devServer] unhandledRejection swallowed:', code)
      return
    }
    // eslint-disable-next-line no-console
    console.log('[devServer] unhandledRejection:', reason)
  })
}

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  // Avoid transpiling ESM libs like vue-echarts to CommonJS in modern builds
  transpileDependencies: [],
  publicPath: '/ui/',
  outputDir: 'lina',
  assetsDir: 'assets',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    host: '0.0.0.0',
    open: false,
    allowedHosts: 'all',
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    watchFiles: ['src/**/*', 'public/**/*'],
    proxy: {
      // change xxx-api/login => mock/login
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      '/api/': {
        target: process.env.VUE_APP_CORE_HOST || 'http://127.0.0.1:8080',
        changeOrigin: true
      },
      '/ws/': {
        // Use HTTP scheme for target even for WS; ws proxying is enabled via ws: true
        target: process.env.VUE_APP_CORE_HOST || 'http://127.0.0.1:8080',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('/ws'),
        onProxyReqWs: wsProxyOnProxyReqWs('/ws')
      },
      '/koko/': {
        target: process.env.VUE_APP_KOKO_HOST || 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('/koko'),
        onProxyReqWs: wsProxyOnProxyReqWs('/koko')
      },
      '/chen/': {
        target: 'http://127.0.0.1:9523',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('/chen'),
        onProxyReqWs: wsProxyOnProxyReqWs('/chen')
      },
      '/guacamole/': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('/guacamole'),
        onProxyReqWs: wsProxyOnProxyReqWs('/guacamole')
      },
      '/luna/': {
        target: 'http://127.0.0.1:4200',
        changeOrigin: true
      },
      '/facelive/': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('/facelive'),
        onProxyReqWs: wsProxyOnProxyReqWs('/facelive')
      },
      '^/(core|static|media)/': {
        target: process.env.VUE_APP_CORE_HOST || 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  },
  css: {},
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    // Temporarily silence ::v-deep deprecation warnings
    // We will migrate to :deep(...) later
    ignoreWarnings: [
      /::v-deep usage as a combinator has been deprecated/
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
        vue$: '@vue/compat',
        // Ensure runtime deps for svg-sprite-loader resolve from top-level node_modules
        'svg-baker-runtime': resolve('node_modules/svg-baker-runtime'),
        'svg-sprite-loader': resolve('node_modules/svg-sprite-loader')
      },
      fallback: {
        path: require.resolve('path-browserify')
      },
      extensions: ['.vue', '.js', '.json']
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugins.delete('preload')

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      // Webpack 5 + ESM interop for loader-generated code
      .type('javascript/auto')
      .resolve.set('fullySpecified', false)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
        // Force absolute module paths to avoid odd relative resolution
        spriteModule: require.resolve('svg-sprite-loader/runtime/browser-sprite.build'),
        symbolModule: require.resolve('svg-baker-runtime/browser-symbol')
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        const compilerOptions = options.compilerOptions || {}
        compilerOptions.preserveWhitespace = true
        compilerOptions.compatConfig = compilerOptions.compatConfig || {}
        compilerOptions.compatConfig.MODE = 2
        compilerOptions.directives = {
          html(node, directiveMeta) {
            const props = node.props || (node.props = [])
            props.push({
              name: 'innerHTML',
              value: `$xss.process(_s(${directiveMeta.value}))`
            })
          }
        }
        options.compilerOptions = compilerOptions
        return options
      })
      .end()

    config
      // Use higher-quality source maps in dev to get accurate file/line
      .when(process.env.NODE_ENV === 'development', config => config.devtool('eval-source-map'))

    config.when(process.env.NODE_ENV === 'production', config => {
      config.plugin('CompressionWebpackPlugin').use(CompressionWebpackPlugin, [
        {
          algorithm: 'gzip',
          test: productionGzipExtensions, // 处理所有匹配此 {RegExp} 的资源
          threshold: 10240, // 只处理比这个值大的资源。按字节计算(楼主设置10K以上进行压缩)
          minRatio: 0.8, // 只有压缩率比这个值小的资源才会被处理
          cache: false
        }
      ])
    })

    config.when(process.env.NODE_ENV !== 'development', config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end()
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementPlus: {
            name: 'chunk-elementPlus', // split elementPlus into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-plus(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      config.optimization.runtimeChunk('single')
    })
  }
}
