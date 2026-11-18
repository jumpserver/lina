import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { createRenderer, h, KeepAlive, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { redirectLegacyMCPSettings } from '../src/router/settings/legacy-mcp.js'

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
}
async function load(path, dependencies = {}) {
  const raw = await source(path)
  const script = path.endsWith('.vue') ? parse(raw).descriptor.script.content : raw
  return new Function(
    ...Object.keys(dependencies),
    script.replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*$/gm, '').replace('export default', 'return')
  )(...Object.values(dependencies))
}
const routeView = new Function(
  'DRAWER_QUERY_KEYS',
  (await source('utils/vue/routeView.js')).replace(/^import .*$/gm, '').replaceAll('export function', 'function') +
    '\nreturn { getRouteCacheKey, isRouteShellComponent }'
)(['drawer', 'drawerTab', 'drawerAction'])
const CachedRouterView = await load('layout/components/CachedRouterView.vue', routeView)
const settings = await load('router/settings/index.js', {
  i18n: { t: (value) => value }, empty: {}, store: {}, openJDMC() {}, getFirstAccessibleChildPath() {}, redirectLegacyMCPSettings
})
const roleRoute = settings.children.find((route) => route.path === '/settings/roles').children.find((route) => route.name === 'RoleList')
const TabPage = await load('layout/components/TabPage/index.vue', {
  Icon: {}, Page: {}, TAB_NAVIGATION_CONTEXT: Symbol('tab'),
  TAB_NAVIGATION_SCOPE: { LOCAL: 'local', ROUTE: 'route', DRAWER: 'drawer' },
  toSentenceCase: (value) => value, resolveAsyncComponentCompat: (value) => value,
  localStorage: { getItem() {}, setItem() {} }
})
TabPage.render = () => null
const RoleList = await load('views/users/Role/RoleList/index.vue', { TabPage })
const roleMounted = RoleList.mounted
const instances = []
RoleList.mounted = function () { instances.push(this); roleMounted.call(this) }
RoleList.render = function () {
  return h(TabPage, {
    ref: 'tabs', submenu: this.config.submenu, activeMenu: this.config.activeMenu,
    'onUpdate:activeMenu': (value) => { this.config.activeMenu = value }
  })
}
const renderer = createRenderer({
  createElement: () => ({ children: [] }), createText: (text) => ({ text }), createComment: (text) => ({ text }),
  setText() {}, setElementText() {}, patchProp() {}, parentNode: (node) => node.parent, nextSibling: () => null,
  insert(node, parent) { node.parent = parent; parent.children.push(node) },
  remove(node) { const list = node.parent?.children; const i = list?.indexOf(node); if (i >= 0) list.splice(i, 1) }
})
async function flush() {
  for (let i = 0; i < 8; i++) { await nextTick(); await new Promise((resolve) => setImmediate(resolve)) }
}

async function fixture(query = {}) {
  instances.length = 0
  const orgA = { id: 'org-a' }
  const orgB = { id: 'org-b' }
  const global = { id: 'global', autoEnter: 1 }
  const switches = []
  const store = createStore({
    modules: { users: {
      namespaced: true,
      state: () => ({ currentOrg: global, preOrg: orgA }),
      actions: {
        enterGlobalOrg({ state }) {
          switches.push('global')
          if (switches.length > 20) throw new Error('organization switch loop')
          if (!state.currentOrg.autoEnter) state.preOrg = state.currentOrg
          state.currentOrg = global
        },
        leaveGlobalOrg({ state }) {
          switches.push('local')
          if (switches.length > 20) throw new Error('organization switch loop')
          state.currentOrg = state.preOrg
        }
      }
    } },
    getters: { currentOrg: (state) => state.users.currentOrg, hasValidLicense: () => true }
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/settings/roles', name: roleRoute.name, meta: roleRoute.meta, component: RoleList },
      { path: '/other', component: {} }
    ]
  })
  const errors = []
  const app = renderer.createApp({
    render() {
      const route = router.currentRoute.value
      const key = CachedRouterView.methods.getRouteCacheKey.call({ $store: store }, route)
      return h(KeepAlive, () => route.name === 'RoleList' ? h(RoleList, { key }) : null)
    }
  })
  app.config.globalProperties.$t = (value) => value
  app.config.globalProperties.$hasPerm = () => true
  app.config.globalProperties.$context = { get() {} }
  app.config.errorHandler = (error) => { errors.push(error) }
  app.use(store)
  app.use(router)
  await router.push({ path: '/settings/roles', query })
  app.mount({ children: [] })
  await flush()
  return { app, store, router, orgA, orgB, global, switches, errors }
}

test('role tabs switch organization without remounting or looping, and keep per-org caches', async () => {
  const f = await fixture()
  const vm = instances[0]
  assert.equal(f.store.state.users.currentOrg.id, 'global')
  vm.$refs.tabs.iActiveMenu = 'OrgRoleList'
  vm.handleTabClick?.({ name: 'OrgRoleList' })
  await flush()
  assert.equal(f.store.state.users.currentOrg.id, 'org-a')
  assert.equal(f.router.currentRoute.value.query.tab, 'OrgRoleList')
  assert.equal(instances.length, 1)
  vm.$refs.tabs.iActiveMenu = 'SysRoleList'
  vm.handleTabClick?.({ name: 'SysRoleList' })
  await flush()
  assert.equal(f.store.state.users.currentOrg.id, 'global')
  assert.equal(instances.length, 1)
  assert.deepEqual(f.errors, [])
  assert.ok(f.switches.length < 10)
  // A real change of selected organization must use a separate cache.
  const route = f.router.currentRoute.value
  const globalKey = CachedRouterView.methods.getRouteCacheKey.call({ $store: f.store }, route)
  f.store.state.users.preOrg = f.orgB
  const otherKey = CachedRouterView.methods.getRouteCacheKey.call({ $store: f.store }, route)
  assert.notEqual(globalKey, otherKey)
  f.app.unmount()
})

test('direct org tab and history navigation synchronize the organization', async () => {
  const f = await fixture({ tab: 'OrgRoleList' })
  assert.equal(f.store.state.users.currentOrg.id, 'org-a')
  assert.equal(instances.length, 1)
  await f.router.push({ path: '/settings/roles', query: { tab: 'SysRoleList' } })
  await flush()
  assert.equal(f.store.state.users.currentOrg.id, 'global')
  f.router.back()
  await flush()
  assert.equal(f.store.state.users.currentOrg.id, 'org-a')
  f.router.forward()
  await flush()
  assert.equal(f.store.state.users.currentOrg.id, 'global')
  assert.equal(instances.length, 1)
  assert.deepEqual(f.errors, [])
  f.app.unmount()
})
