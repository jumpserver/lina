import path from 'node:path'
import { fileURLToPath } from 'node:url'
import autoprefixer from 'autoprefixer'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createObjectProperty, createSimpleExpression } from '@vue/compiler-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = 'assets'
const outputDir = 'lina'

// 配置加载即求值：生产环境下等于 Docker 构建时刻，开发环境下等于 dev server 启动时刻。
// 容器默认 UTC，这里统一格式化为北京时间避免时区困惑。
const BUILD_TIME = new Date().toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  hour12: false
})

function resolvePath(dir) {
  return path.resolve(__dirname, dir)
}

function normalizePublicPath(value) {
  if (!value) {
    return '/ui/'
  }
  return value.endsWith('/') ? value : `${value}/`
}

function createHtmlDirectiveTransform() {
  return function html(dir) {
    const expression = dir.exp ? dir.exp.content : ''
    return {
      props: [
        createObjectProperty(
          createSimpleExpression('innerHTML', true),
          createSimpleExpression(`window.$xss.process(String(${expression} || ''))`, false)
        )
      ]
    }
  }
}

function createClientEnv(mode) {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    ...env,
    NODE_ENV: mode === 'development' ? 'development' : 'production'
  }
}

function createAssetFileName(assetInfo) {
  const ext = path.extname(assetInfo.name || '').toLowerCase()

  if (ext === '.css') {
    return `${assetsDir}/css/[name].[hash][extname]`
  }
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.svg'].includes(ext)) {
    return `${assetsDir}/img/[name].[hash][extname]`
  }
  if (['.woff', '.woff2', '.eot', '.ttf', '.otf'].includes(ext)) {
    return `${assetsDir}/fonts/[name].[hash][extname]`
  }
  return `${assetsDir}/[name].[hash][extname]`
}

function createProxy(target, ws = false) {
  return {
    target,
    changeOrigin: true,
    ws
  }
}

function createCorsOptions() {
  return {
    // JumpServer uses real OPTIONS requests for table/form metadata.
    // Vite's default CORS middleware ends OPTIONS early, before proxying.
    preflightContinue: true
  }
}

export default defineConfig(({ mode }) => {
  const env = createClientEnv(mode)
  const publicPath = normalizePublicPath(env.VITE_PUBLIC_PATH || '/ui/')
  const coreHost = env.VITE_CORE_HOST || 'http://127.0.0.1:8080'
  const kokoHost = env.VITE_KOKO_HOST || 'http://127.0.0.1:5000'
  const port = Number(process.env.PORT || process.env.port || process.env.npm_config_port || 9528)

  return {
    base: publicPath,
    envPrefix: 'VITE_',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': resolvePath('src'),
        'markdown-it/lib/token$': resolvePath('node_modules/markdown-it/lib/token.mjs')
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      __BUILD_TIME__: JSON.stringify(BUILD_TIME),
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            preserveWhitespace: true,
            directiveTransforms: {
              html: createHtmlDirectiveTransform()
            }
          }
        }
      }),
      vueJsx()
    ],
    css: {
      devSourcemap: mode === 'development',
      postcss: {
        plugins: [autoprefixer()]
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port,
      open: false,
      cors: createCorsOptions(),
      proxy: {
        '/api/': createProxy(coreHost),
        '/ws/': createProxy(coreHost, true),
        '/koko/': createProxy(kokoHost, true),
        '/chen/': createProxy('http://127.0.0.1:9523', true),
        '/guacamole/': createProxy('http://127.0.0.1:8081', true),
        '/luna/': createProxy('http://127.0.0.1:4200'),
        '/facelive/': createProxy('http://localhost:9999', true),
        '/core/': createProxy(coreHost),
        '/static/': createProxy(coreHost),
        '/media/': createProxy(coreHost),
        '/private-media/': createProxy(coreHost)
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 9526,
      cors: createCorsOptions()
    },
    build: {
      outDir: outputDir,
      assetsDir,
      minify: 'oxc',
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          entryFileNames: `${assetsDir}/js/[name].[hash].js`,
          chunkFileNames: `${assetsDir}/js/[name].[hash].js`,
          assetFileNames: createAssetFileName
        }
      }
    }
  }
})
