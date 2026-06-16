const fs = require('fs')
const net = require('net')
const path = require('path')
const dotenv = require('dotenv')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { createObjectProperty, createSimpleExpression } = require('@vue/compiler-core')

const outputDir = 'lina'
const assetsDir = 'assets'
const productionGzipExtensions = /\.(js|css|json|txt|ico|svg)(\?.*)?$/i

const resolvePath = dir => path.join(__dirname, dir)

function normalizePublicPath(value) {
  if (!value) {
    return '/ui/'
  }
  return value.endsWith('/') ? value : `${value}/`
}

function canListen(port, host = '0.0.0.0') {
  return new Promise(resolve => {
    const server = net.createServer()

    server.unref()
    server.once('error', () => resolve(false))
    server.listen({ port, host }, () => {
      server.close(() => resolve(true))
    })
  })
}

async function resolveDevServerPort(port) {
  const normalizedPort = Number(port)

  if (!Number.isInteger(normalizedPort) || normalizedPort <= 0) {
    return port || 'auto'
  }

  if (await canListen(normalizedPort)) {
    return normalizedPort
  }

  console.warn(`[dev-server] Port ${normalizedPort} is already in use, falling back to an available port.`)
  return 'auto'
}

function loadEnv(mode) {
  const files = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`
  ]
  const parsed = {}

  files.forEach(file => {
    const fullPath = resolvePath(file)
    if (!fs.existsSync(fullPath)) {
      return
    }
    Object.assign(parsed, dotenv.parse(fs.readFileSync(fullPath)))
  })

  return {
    ...parsed,
    NODE_ENV: process.env.NODE_ENV || parsed.NODE_ENV || (mode === 'development' ? 'development' : 'production')
  }
}

function makeEnvDefinitions(env) {
  return Object.keys(env).reduce((definitions, key) => {
    if (key === 'NODE_ENV' || key === 'ENV' || key.startsWith('VUE_APP_')) {
      definitions[`process.env.${key}`] = JSON.stringify(env[key])
    }
    return definitions
  }, {})
}

function createStyleLoaders(isDevelopment, preProcessor, options = {}) {
  const loaders = [
    isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        sourceMap: isDevelopment,
        ...options
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: isDevelopment
      }
    }
  ]

  if (preProcessor) {
    loaders.push({
      loader: preProcessor,
      options: {
        sourceMap: isDevelopment,
        sassOptions: {
          quietDeps: true
        }
      }
    })
  }

  return loaders
}

function createHtmlDirectiveTransform() {
  return function html(dir) {
    const expression = dir.exp ? dir.exp.content : ''
    return {
      props: [
        createObjectProperty(
          createSimpleExpression('innerHTML', true),
          createSimpleExpression(`$xss.process(String(${expression} || ''))`, false)
        )
      ]
    }
  }
}

function stripPublicPath(src, publicPath) {
  if (!src) {
    return src
  }
  if (src.startsWith(publicPath)) {
    return src.slice(publicPath.length)
  }
  return src.replace(/^\//, '')
}

class InlineRuntimeChunkPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('InlineRuntimeChunkPlugin', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap('InlineRuntimeChunkPlugin', data => {
        const publicPath = compilation.outputOptions.publicPath || ''
        const inline = tag => {
          if (tag.tagName !== 'script' || !tag.attributes || !tag.attributes.src) {
            return tag
          }
          if (!/runtime\..*\.js$/.test(tag.attributes.src)) {
            return tag
          }

          const assetName = stripPublicPath(tag.attributes.src, publicPath)
          const asset = compilation.assets[assetName]
          if (!asset) {
            return tag
          }

          tag.innerHTML = asset.source()
          delete tag.attributes.src
          return tag
        }

        data.headTags = data.headTags.map(inline)
        data.bodyTags = data.bodyTags.map(inline)
        return data
      })
    })
  }
}

function wsProxyOnError(tag) {
  return err => {
    if (!err || err.code === 'ECONNRESET' || err.code === 'EPIPE') {
      return
    }
    console.warn(`[dev-proxy:${tag}] websocket proxy error: ${err.message || err}`)
  }
}

function wsProxyOnProxyReqWs(tag) {
  return (proxyReq, req) => {
    proxyReq.on('error', err => {
      if (!err || err.code === 'ECONNRESET' || err.code === 'EPIPE') {
        return
      }
      console.warn(`[dev-proxy:${tag}] websocket request error: ${err.message || err}`)
    })
    if (req && req.socket) {
      req.socket.on('error', err => {
        if (!err || err.code === 'ECONNRESET' || err.code === 'EPIPE') {
          return
        }
        console.warn(`[dev-proxy:${tag}] websocket socket error: ${err.message || err}`)
      })
    }
  }
}

function installDevProxyErrorHandlers() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  process.on('uncaughtException', err => {
    if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
      return
    }
    throw err
  })
  process.on('unhandledRejection', err => {
    if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
      return
    }
    console.error(err)
  })
}

function createDevServer({ port, publicPath, coreHost, kokoHost }) {
  const webSocketURL = {
    pathname: '/ws'
  }

  if (port !== 'auto') {
    webSocketURL.port = port
  }

  return {
    port,
    host: '0.0.0.0',
    server: 'http',
    open: false,
    allowedHosts: 'all',
    hot: true,
    liveReload: false,
    historyApiFallback: {
      index: `${publicPath}index.html`
    },
    devMiddleware: {
      publicPath
    },
    static: {
      directory: resolvePath('public'),
      publicPath,
      watch: true
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      },
      webSocketURL
    },
    onListening(devServer) {
      const server = devServer && devServer.server
      if (server && typeof server.getMaxListeners === 'function' && typeof server.setMaxListeners === 'function') {
        const current = server.getMaxListeners()
        if (current > 0 && current < 32) {
          server.setMaxListeners(32)
        }
      }
    },
    watchFiles: ['src/**/*', 'public/**/*'],
    proxy: [
      {
        context: ['/api/'],
        target: coreHost,
        changeOrigin: true
      },
      {
        context: ['/ws/'],
        target: coreHost,
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('core-ws'),
        onProxyReqWs: wsProxyOnProxyReqWs('core-ws')
      },
      {
        context: ['/koko/'],
        target: kokoHost,
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('koko-ws'),
        onProxyReqWs: wsProxyOnProxyReqWs('koko-ws')
      },
      {
        context: ['/chen/'],
        target: 'http://127.0.0.1:9523',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('chen-ws'),
        onProxyReqWs: wsProxyOnProxyReqWs('chen-ws')
      },
      {
        context: ['/guacamole/'],
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('guacamole-ws'),
        onProxyReqWs: wsProxyOnProxyReqWs('guacamole-ws')
      },
      {
        context: ['/luna/'],
        target: 'http://127.0.0.1:4200',
        changeOrigin: true
      },
      {
        context: ['/facelive/'],
        target: 'http://localhost:9999',
        changeOrigin: true,
        ws: true,
        onError: wsProxyOnError('facelive-ws'),
        onProxyReqWs: wsProxyOnProxyReqWs('facelive-ws')
      },
      {
        context: ['/core/', '/static/', '/media/'],
        target: coreHost,
        changeOrigin: true
      }
    ]
  }
}

module.exports = {
  InlineRuntimeChunkPlugin,
  assetsDir,
  createDevServer,
  createHtmlDirectiveTransform,
  createStyleLoaders,
  installDevProxyErrorHandlers,
  loadEnv,
  makeEnvDefinitions,
  normalizePublicPath,
  outputDir,
  productionGzipExtensions,
  resolveDevServerPort,
  resolvePath
}
