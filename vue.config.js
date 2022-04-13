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

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  transpileDependencies: [
    /\/node_modules\/vue-echarts\//,
    /\/node_modules\/resize-detector\//
  ],
  publicPath: '/ui/',
  outputDir: 'lina',
  assetsDir: 'assets',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    host: '0.0.0.0',
    open: false,
    disableHostCheck: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      // change xxx-api/login => mock/login
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      '/api/': {
        target: process.env.VUE_APP_CORE_HOST,
        changeOrigin: true
      },
      '/ws/': {
        target: process.env.VUE_APP_CORE_WS,
        changeOrigin: true,
        ws: true
      },
      '/koko/': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true
      },
      '/guacamole/': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true
      },
      '/luna/': {
        target: 'http://127.0.0.1:4200/luna/',
        changeOrigin: true
      },
      '^/(core|static|media)/': {
        target: process.env.VUE_APP_CORE_HOST,
        changeOrigin: true
      }
    },
    after: require('./mock/mock-server.js')
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src'),
        elementCss: resolve('node_modules/element-ui/lib/theme-chalk/index.css'),
        elementLocale: resolve('node_modules/element-ui/lib/locale/lang/en.js')
      },
      extensions: ['.vue', '.js', '.json']
    },
    plugins: [
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: productionGzipExtensions, // 处理所有匹配此 {RegExp} 的资源
        threshold: 10240, // 只处理比这个值大的资源。按字节计算(楼主设置10K以上进行压缩)
        minRatio: 0.8 // 只有压缩率比这个值小的资源才会被处理
      })
    ]
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    // config.plugins.delete('preload')

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
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
    // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
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
        }
      )
  }
}
