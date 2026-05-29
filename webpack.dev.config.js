const createCommonConfig = require('./webpack.common.config')
const {
  createDevServer,
  installDevProxyErrorHandlers,
  loadEnv,
  normalizePublicPath
} = require('./webpack.parts')

installDevProxyErrorHandlers()

module.exports = (webpackEnv = {}) => {
  const mode = webpackEnv.mode || 'development'
  const appEnv = loadEnv(mode)
  const publicPath = normalizePublicPath(appEnv.VUE_APP_PUBLIC_PATH || '/ui/')
  const coreHost = appEnv.VUE_APP_CORE_HOST || 'http://127.0.0.1:8080'
  const kokoHost = appEnv.VUE_APP_KOKO_HOST || 'http://127.0.0.1:5000'
  const port = process.env.port || process.env.npm_config_port || 9528

  return {
    ...createCommonConfig({
      appEnv,
      isDevelopment: true,
      publicPath
    }),
    mode: 'development',
    devtool: 'eval-source-map',
    optimization: {},
    devServer: createDevServer({
      coreHost,
      kokoHost,
      port,
      publicPath
    })
  }
}
