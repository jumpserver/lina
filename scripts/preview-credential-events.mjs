// Run: node scripts/preview-credential-events.mjs
// Separate localhost-only Vite server; never imports the application's network layer.
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entry = `
import { createApp, ref } from 'vue'
import ElementPlus from 'element-plus'
import zhLocale from 'element-plus/es/locale/lang/zh-cn'
import * as icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import '/src/styles/default-theme.scss'
import CredentialEventBrowser from '/src/views/accounts/Integration/AccountRotationDetail/CredentialEventBrowser.vue'
import zh from '/src/i18n/langs/zh.json'
const app = createApp({
  components: { CredentialEventBrowser },
  setup() { return { mode: ref('rotation'), count: ref(300) } },
  template: ${JSON.stringify(`<main class="preview"><header class="preview-tools"><strong>凭据事件 · 本地模拟预览</strong><span>仅合成数据，不连接业务 API</span><label>模式 <select v-model="mode"><option value="rotation">轮换模式</option><option value="subscription">订阅模式</option></select></label><label>接入数量 <select v-model.number="count"><option :value="100">100</option><option :value="300">300</option><option :value="500">500</option></select></label><span>SDK / Agent 各半 · 180 条历史事件</span></header><CredentialEventBrowser :key="mode + count" :credential-id="mode + '-' + count" :subscription="mode === 'subscription'" /></main>`)}
})
app.config.globalProperties.$t = (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll('{' + name + '}', value), zh[key] || key)
app.use(ElementPlus, { size: 'small', locale: zhLocale })
for (const [name, icon] of Object.entries(icons)) app.component(name, icon)
app.mount('#app')
`
const api = `
import { createCredentialEventFixture, fixtureHistory, fixtureRotation } from '/scripts/fixtures/credential-events.mjs'
const fixtures = new Map()
function fixture(id) {
  if (!fixtures.has(id)) { const [mode, count] = id.split('-'); fixtures.set(id, createCredentialEventFixture(mode, Number(count))) }
  return fixtures.get(id)
}
export async function getCredentialEventHistory(id, params) { return fixtureHistory(fixture(id), params) }
export async function getCredentialRotationEvents(id, params) { return fixtureRotation(fixture(id), params.rotation_id) }
`
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>凭据客户端事件 · 模拟预览</title><style>body{margin:0;background:#f3f3f4;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#292827}.preview{padding:20px}.preview-tools{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;margin-bottom:18px}.preview-tools>span{font-size:12px;color:#51565d}.preview-tools label{display:flex;align-items:center;gap:8px}.preview-tools select{font:inherit;padding:6px;border:1px solid #bbbfc4;background:white}*{box-sizing:border-box}@media(max-width:760px){.preview{padding:12px}}</style><div id="app"></div><script type="module" src="/@id/virtual:event-preview"></script></html>`
const server = await createServer({
  root,
  configFile: false,
  base: '/',
  cacheDir: path.join(root, 'node_modules/.vite-credential-events-preview'),
  optimizeDeps: {
    noDiscovery: true,
    entries: [],
    include: ['vue', 'element-plus', '@element-plus/icons-vue']
  },
  plugins: [
    {
      name: 'isolated-credential-event-preview',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'virtual:event-preview') return '\0event-preview'
        if (id === 'virtual:event-api') return '\0event-api'
        if (id === 'virtual:event-date') return '\0event-date'
      },
      load(id) {
        if (id === '\0event-preview') return entry
        if (id === '\0event-api') return api
        if (id === '\0event-date')
          return 'export const toSafeLocalDateStr = value => new Date(value).toLocaleString("sv-SE")'
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/') return next()
          server
            .transformIndexHtml('/', html)
            .then((page) => {
              res.setHeader('Content-Type', 'text/html')
              res.end(page)
            })
            .catch(next)
        })
      }
    },
    vue()
  ],
  resolve: {
    alias: [
      { find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' },
      { find: '@/api/applicationCredential', replacement: 'virtual:event-api' },
      { find: '@/composables/useDateTime', replacement: 'virtual:event-date' },
      { find: '@', replacement: path.join(root, 'src') }
    ]
  },
  server: { host: '127.0.0.1', port: 9538, strictPort: true },
  css: { preprocessorOptions: { scss: { quietDeps: true } } }
})
await server.listen()
server.printUrls()
