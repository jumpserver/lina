const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const createCommonConfig = require('./webpack.common.config')
const {
  InlineRuntimeChunkPlugin,
  assetsDir,
  loadEnv,
  normalizePublicPath,
  productionGzipExtensions,
  resolvePath
} = require('./webpack.parts')

module.exports = (webpackEnv = {}) => {
  const mode = webpackEnv.mode || process.env.NODE_ENV || 'production'
  const appEnv = loadEnv(mode)
  const publicPath = normalizePublicPath(appEnv.VUE_APP_PUBLIC_PATH || '/ui/')
  const commonConfig = createCommonConfig({
    appEnv,
    isDevelopment: false,
    publicPath
  })

  return {
    ...commonConfig,
    mode: 'production',
    devtool: false,
    plugins: [
      ...commonConfig.plugins,
      new MiniCssExtractPlugin({
        filename: `${assetsDir}/css/[name].[contenthash:8].css`,
        chunkFilename: `${assetsDir}/css/[name].[contenthash:8].css`,
        ignoreOrder: true
      }),
      new CompressionPlugin({
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      }),
      new InlineRuntimeChunkPlugin()
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementPlus: {
            name: 'chunk-elementPlus',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-plus(.*)/
          },
          commons: {
            name: 'chunk-commons',
            test: resolvePath('src/components'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single'
    }
  }
}
