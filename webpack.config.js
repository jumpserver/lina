module.exports = (webpackEnv = {}, argv = {}) => {
  const mode = webpackEnv.mode || process.env.NODE_ENV || argv.mode || 'production'
  const configFactory = mode === 'development'
    ? require('./webpack.dev.config')
    : require('./webpack.prod.config')

  return configFactory(webpackEnv, argv)
}
