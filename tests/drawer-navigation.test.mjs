import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { createRenderer, h, computed, unref, markRaw, toRaw, nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createStore, mapGetters } from 'vuex'
import lodash from 'lodash'

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
}
async function load(path, dependencies = {}) {
  const raw = await source(path)
  const script = path.endsWith('.vue') ? parse(raw).descriptor.script.content : raw
  return new Function(
    ...Object.keys(dependencies),
    script
      .replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*$/gm, '')
      .replace('export default', 'return')
  )(...Object.values(dependencies))
}
const routeTools = await import(
  `data:text/javascript;base64,${Buffer.from(await source('components/Drawer/route.js')).toString('base64')}`
)
const { closeDetailDrawer, readDrawerRoute, drawerRouteKey, DRAWER_QUERY_KEYS } = routeTools
const getRouteCacheKey = new Function(
  'DRAWER_QUERY_KEYS',
  (await source('utils/vue/routeView.js'))
    .replace(/^import .*$/gm, '')
    .replaceAll('export function', 'function') + '\nreturn getRouteCacheKey'
)(DRAWER_QUERY_KEYS)
const DRAWER_RUNTIME_CONTEXT = Symbol('drawer')
const TAB_NAVIGATION_CONTEXT = Symbol('tab')
const TAB_NAVIGATION_SCOPE = { LOCAL: 'local', ROUTE: 'route', DRAWER: 'drawer' }
const resolveRoute = (route, router) => {
  try {
    return router.resolve(route).matched.find((item) => item.name === route.name)
  } catch {
    return undefined
  }
}
const mixin = await load('components/Drawer/pageMixin.js', {
  markRaw,
  toRaw,
  mapGetters,
  _: lodash,
  resolveRoute,
  toLowerCaseExcludeAbbr: (value) => value,
  toSentenceCase: (value) => lodash.upperFirst(value)
})
const createContextService = await load('libs/context/index.js', { unref, DRAWER_RUNTIME_CONTEXT })
const Drawer = await load('components/Drawer/index.vue', {
  computed,
  getStoredDrawerWidth: () => '60%',
  useDrawerResize: () => ({}),
  resolveAsyncComponentCompat: (component) => component,
  DRAWER_RUNTIME_CONTEXT,
  TAB_NAVIGATION_CONTEXT,
  TAB_NAVIGATION_SCOPE
})
// Keep real component props/provide/lifecycle. Substitute only the DOM/Element
// Plus shell so these tests run with Vue's actual scheduler without a browser.
Drawer.render = function () {
  return this.visible && this.component
    ? h(this.component, { ...this.componentProps, key: this.componentKey })
    : null
}
const TabPage = await load('layout/components/TabPage/index.vue', {
  Icon: {},
  Page: {},
  TAB_NAVIGATION_CONTEXT,
  TAB_NAVIGATION_SCOPE,
  toSentenceCase: (value) => value,
  resolveAsyncComponentCompat: (value) => value,
  localStorage: { getItem() {}, setItem() {} }
})
TabPage.render = () => null
const events = []
const Host = await load('components/Drawer/RouteDrawerHost.vue', {
  Drawer,
  drawerPageMixin: mixin,
  closeDetailDrawer,
  drawerRouteKey,
  readDrawerRoute,
  TAB_NAVIGATION_SCOPE,
  eventBus: { emit: (...args) => events.push(args) }
})
Host.render = function () {
  return this.drawerComponent
    ? h(Drawer, {
        visible: this.drawerVisible,
        component: this.drawerComponent,
        componentKey: this.drawerGeneration,
        componentProps: this.mergedDrawerProps,
        tabNavigation: this.tabNavigation
      })
    : null
}
function renderer() {
  return createRenderer({
    createElement: () => ({ children: [] }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ text }),
    setText() {},
    setElementText() {},
    patchProp() {},
    parentNode: (node) => node.parent,
    nextSibling: () => null,
    insert(node, parent) {
      node.parent = parent
      parent.children.push(node)
    },
    remove(node) {
      const list = node.parent?.children
      const i = list?.indexOf(node)
      if (i >= 0) list.splice(i, 1)
    }
  })
}
async function flush() {
  for (let i = 0; i < 8; i++) {
    await nextTick()
    await new Promise((resolve) => setImmediate(resolve))
  }
}
async function fixture(initial = '/assets?tab=all', component = Host) {
  const captures = []
  const Detail = {
    data() {
      return { active: 'Basic', nested: false }
    },
    created() {
      captures.push({ id: this.$context.get('id'), action: this.$context.get('action'), vm: this })
    },
    render() {
      return h('div', [
        h(TabPage, {
          ref: 'tabs',
          activeMenu: this.active,
          'onUpdate:activeMenu': (value) => {
            this.active = value
          },
          submenu: [
            { name: 'Basic' },
            { name: 'Account' },
            { name: 'Hidden', hidden: true },
            { name: 'Disabled', disabled: true }
          ]
        }),
        this.nested ? h(Local, { ref: 'nested', createDrawer: Editor, updateDrawer: Editor }) : null
      ])
    }
  }
  const Editor = {
    created() {
      captures.push({ id: this.$context.get('id'), action: this.$context.get('action'), vm: this })
    },
    render: () => null
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/assets', name: 'AssetList', component: {}, meta: { title: 'Assets' } },
      {
        path: '/assets/:id',
        name: 'AssetDetail',
        component: Detail,
        meta: { title: 'AssetDetail' }
      },
      { path: '/assets/:id/update', name: 'AssetUpdate', component: Editor },
      { path: '/other', name: 'Other', component: {} }
    ]
  })
  await router.push(initial)
  const common = await load('store/modules/common.js', { optionUrlMeta() {} })
  const store = createStore({
    modules: { common },
    getters: {
      inDrawer: (state) => state.common.inDrawer,
      drawerCloseNonce: (state) => state.common.drawerCloseNonce,
      currentOrg: () => ({ id: 'org-1' })
    }
  })
  const app = renderer().createApp(component, {
    createDrawer: Editor,
    updateDrawer: component === Host ? undefined : Editor
  })
  app.use(store)
  app.use(router)
  app.use(createContextService({ router }))
  app.config.globalProperties.$t = (value) => value
  app.config.globalProperties.$log = { debug() {} }
  const vm = app.mount({ children: [] })
  await flush()
  return { app, vm, router, store, captures, Detail, Editor }
}
const Local = {
  mixins: [mixin],
  computed: {
    tabNavigation() {
      return null
    }
  },
  render: Host.render,
  methods: { reloadTable() {}, handleDetailDeleteSuccess() {}, handleDrawerSubmitSuccess() {} }
}

for (const action of ['create', 'update', 'clone']) {
  test(`asset ${action} waits for the selected category drawer prop`, async () => {
    const BaseList = await load('views/assets/Asset/AssetList/components/BaseList.vue', {
      ListTable: {},
      AssetBulkUpdateDialog: {},
      PlatformDialog: {},
      GatewayDialog: {},
      AccountDiscoverDialog: {},
      AccountCreateUpdate: {},
      mapState: () => ({}),
      getSelectedAssetNodeId: () => 'selected-node'
    })
    const editors = {
      host: markRaw({ render: () => null }),
      database: markRaw({ render: () => null })
    }
    const AssetList = {
      inheritAttrs: false,
      data() {
        return { createDrawer: '', drawer: editors, showPlatform: true }
      },
      methods: {
        createAsset: BaseList.methods.createAsset,
        updateOrCloneAsset: BaseList.methods.updateOrCloneAsset
      },
      render() {
        return h(Local, { ref: 'ListTable', createDrawer: this.createDrawer })
      }
    }
    const f = await fixture('/assets?tab=all', AssetList)
    try {
      for (const category of ['host', 'database']) {
        const platform = {
          id: `${category}-platform`,
          category: { value: category },
          type: { value: category }
        }
        if (action === 'create') {
          await f.vm.createAsset(platform)
        } else {
          await f.vm.updateOrCloneAsset({ ...platform, id: `${category}-asset`, platform }, action)
        }
        await flush()
        const drawer = f.vm.$refs.ListTable
        assert.equal(drawer.drawerVisible, true)
        assert.equal(toRaw(drawer.drawerComponent), editors[category])
        assert.equal(drawer.drawerContext.action, action)
        assert.equal(drawer.drawerContext.query.platform, platform.id)
        assert.equal(drawer.drawerContext.query.category, category)
        if (action === 'create') {
          assert.equal(drawer.drawerContext.query.node_id, 'selected-node')
        } else {
          assert.equal(drawer.drawerContext.id, `${category}-asset`)
        }
        drawer.handleDrawerRequestClose()
        await flush()
      }
    } finally {
      f.app.unmount()
    }
  })
}

test('first close cleans stack and route; reopening the same editor reads the new object', async () => {
  const f = await fixture('/assets?tab=all', Local)
  f.vm.onUpdate({ row: { id: 'A' } })
  await flush()
  assert.equal(f.captures.at(-1).id, 'A')
  f.vm.handleDrawerRequestClose()
  await flush()
  assert.equal(f.store.getters.inDrawer, false)
  assert.equal(f.store.state.common.drawerStack.length, 0)
  assert.equal(f.router.currentRoute.value.params.id, undefined)
  assert.equal(f.vm.drawerComponent, null)
  f.vm.onUpdate({ row: { id: 'B' } })
  await flush()
  assert.equal(f.captures.at(-1).id, 'B')
  // Switching record without closing must remount even if its component is identical.
  f.vm.onUpdate({ row: { id: 'C' } })
  await flush()
  assert.deepEqual(
    f.captures.map((item) => item.id),
    ['A', 'B', 'C']
  )
  assert.equal(f.store.state.common.drawerStack.length, 1)
  f.app.unmount()
})

test('provided context stays reactive when its object is replaced', async () => {
  const f = await fixture('/assets?tab=all', Local)
  f.vm.onUpdate({ row: { id: 'A' } })
  await flush()
  const child = f.captures.at(-1).vm
  f.vm.drawerContext = { ...f.vm.drawerContext, id: 'B', params: { id: 'B' } }
  await flush()
  assert.equal(child.$context.get('id'), 'B')
  f.app.unmount()
})

test('legacy cleanup never overwrites the destination route or the background tab', async () => {
  const f = await fixture('/assets?tab=all', Local)
  f.vm.onUpdate({ row: { id: 'A' }, query: { tab: 'Account', type: 'host' } })
  await flush()
  assert.equal(f.router.currentRoute.value.query.tab, 'all')
  await f.router.push('/other?type=database')
  f.vm.handleDrawerRequestClose()
  await flush()
  assert.equal(f.router.currentRoute.value.query.type, 'database')
  assert.deepEqual(f.router.currentRoute.value.params, {})
  f.app.unmount()
})

test('clicking a list detail and switching its tab leave the URL unchanged', async () => {
  const ListPage = await load('components/Table/DrawerListTable/index.vue', {
    ListTable: {},
    Drawer,
    drawerPageMixin: mixin,
    setUrlParam() {},
    eventBus: { on() {}, off() {} }
  })
  const f = await fixture('/assets?tab=all&scope=background', Local)
  const before = f.router.currentRoute.value.fullPath
  ListPage.methods.onDetail.call(f.vm, {
    row: { id: 'A', name: 'Alpha' },
    col: {},
    cellValue: 'Alpha',
    detailRoute: { name: 'AssetDetail', params: { id: 'A' }, query: { tab: 'Account' } }
  })
  await flush()
  assert.equal(f.vm.drawerVisible, true)
  assert.equal(f.captures.at(-1).id, 'A')
  assert.equal(f.captures.at(-1).vm.active, 'Account')
  assert.equal(f.router.currentRoute.value.fullPath, before)
  f.captures.at(-1).vm.$refs.tabs.iActiveMenu = 'Basic'
  await flush()
  assert.equal(f.router.currentRoute.value.fullPath, before)
  f.vm.handleDrawerRequestClose()
  await flush()
  assert.equal(f.router.currentRoute.value.fullPath, before)
  f.app.unmount()
})

test('clicking a card detail opens its local drawer without navigating', async () => {
  const CardTable = await load('components/Table/CardTable/index.vue', {
    mapGetters,
    Pagination: {},
    TableAction: {},
    IBox: {},
    Panel: {},
    Drawer,
    eventBus: { on() {}, off() {} }
  })
  const actions = []
  const vm = {
    detailDrawer: {},
    drawerToken: Symbol('card-drawer'),
    detailDrawerVisible: false,
    isDisabled: () => false,
    $t: (value) => value,
    $store: { dispatch: (...args) => actions.push(args) }
  }
  await CardTable.methods.onView.call(vm, { id: 'A', name: 'Alpha' })
  assert.equal(vm.detailDrawerVisible, true)
  assert.equal(vm.detailContext.id, 'A')
  assert.equal(actions[0][0], 'common/setDrawerActionMeta')
})

test('an explicit link, tab switch, back and forward preserve list state and drawer identity', async () => {
  const f = await fixture('/assets?tab=all&oid=org-1')
  const background = getRouteCacheKey(f.router.currentRoute.value, 'org-1')
  await f.router.push('/assets?tab=all&drawer=AssetDetail&drawerId=A&drawerTab=Account')
  await flush()
  assert.equal(f.vm.drawerVisible, true)
  assert.equal(f.captures.at(-1).id, 'A')
  assert.equal(f.captures.at(-1).vm.active, 'Account')
  assert.equal(f.router.currentRoute.value.query.tab, 'all')
  assert.equal(f.router.currentRoute.value.query.oid, undefined)
  assert.equal(readDrawerRoute(f.router, f.router.currentRoute.value).location.query.oid, undefined)
  assert.equal(getRouteCacheKey(f.router.currentRoute.value, 'org-1'), background)
  f.captures.at(-1).vm.$refs.tabs.iActiveMenu = 'Basic'
  await flush()
  assert.equal(f.router.currentRoute.value.query.drawerTab, 'Basic')
  assert.equal(f.captures.length, 1)
  f.router.back()
  await flush()
  assert.equal(f.vm.drawerVisible, false)
  assert.equal(f.store.getters.inDrawer, false)
  f.router.forward()
  await flush()
  assert.equal(f.vm.drawerVisible, true)
  assert.equal(f.captures.at(-1).vm.active, 'Basic')
  f.app.unmount()
})

test('a pasted link opens without a list row and closes onto its background', async () => {
  const f = await fixture('/assets?tab=all&drawer=AssetDetail&drawerId=B&drawerTab=Account')
  assert.equal(f.captures.at(-1).id, 'B')
  assert.equal(f.captures.at(-1).vm.active, 'Account')
  f.vm.handleDrawerRequestClose()
  await flush()
  assert.equal(f.router.currentRoute.value.path, '/assets')
  assert.equal(f.router.currentRoute.value.query.drawer, undefined)
  assert.equal(f.router.currentRoute.value.query.tab, 'all')
  assert.equal(f.store.getters.inDrawer, false)
  f.app.unmount()
})

test('hidden, disabled and unknown tabs fall back and normalize the share URL', async () => {
  for (const tab of ['Hidden', 'Disabled', 'Missing']) {
    const f = await fixture(`/assets?tab=all&drawer=AssetDetail&drawerId=A&drawerTab=${tab}`)
    assert.equal(f.captures.at(-1).vm.active, 'Basic')
    assert.equal(f.router.currentRoute.value.query.drawerTab, 'Basic')
    assert.equal(f.router.currentRoute.value.query.tab, 'all')
    f.app.unmount()
  }
})

test('detail to edit keeps the correct action/id and clears everything on successful submit', async () => {
  const f = await fixture('/assets?drawer=AssetDetail&drawerId=A')
  f.vm.handleDrawerRequestUpdate({
    row: { id: 'A' },
    route: { name: 'AssetUpdate', params: { id: 'A' } }
  })
  await flush()
  assert.equal(f.captures.at(-1).action, 'update')
  assert.equal(f.captures.at(-1).id, 'A')
  await f.store.dispatch('common/finishDrawerActionMeta', { action: 'update', row: { id: 'A' } })
  await flush()
  assert.equal(f.router.currentRoute.value.query.drawer, undefined)
  assert.equal(f.store.state.common.drawerStack.length, 0)
  f.app.unmount()
})

test('changing URL record replaces content and stale responses cannot change the new title', async () => {
  const f = await fixture('/assets?drawer=AssetDetail&drawerId=A')
  const loadedA = f.vm.drawerContext.handlers.loaded
  await f.router.push('/assets?drawer=AssetDetail&drawerId=B')
  await flush()
  assert.equal(f.captures.at(-1).id, 'B')
  const title = f.vm.drawerTitle
  loadedA({ name: 'stale A' })
  assert.equal(f.vm.drawerTitle, title)
  f.app.unmount()
})

test('malformed, missing and non-detail routes never mount URL-selected components', async () => {
  const f = await fixture()
  for (const query of [
    { drawer: 'AssetUpdate', drawerId: 'A' },
    { drawer: 'MissingDetail', drawerId: 'A' },
    { drawer: 'AssetDetail', drawerId: ['A', 'B'] },
    { drawer: 'AssetDetail', drawerId: 'A', drawerQuery: '{' }
  ]) {
    assert.equal(readDrawerRoute(f.router, { query }).invalid, true)
  }
  assert.equal(readDrawerRoute(f.router, { query: {} }), null)
  f.app.unmount()
})

test('resource-specific query values round trip separately from the background query', async () => {
  const f = await fixture('/assets?tab=all&scope=background')
  await f.router.push(
    `/assets?tab=all&scope=background&drawer=AssetDetail&drawerId=A&drawerTab=Account&drawerQuery=${encodeURIComponent(JSON.stringify({ scope: 'org' }))}`
  )
  await flush()
  const route = f.router.currentRoute.value
  assert.equal(route.query.scope, 'background')
  assert.equal(readDrawerRoute(f.router, route).location.query.scope, 'org')
  assert.equal(f.vm.drawerContext.query.scope, 'org')
  f.app.unmount()
})

test('closing an explicit link removes only drawer parameters', () => {
  let replaced
  const router = {
    currentRoute: {
      value: { path: '/assets', query: { tab: 'all', drawer: 'AssetDetail', drawerId: 'A' } }
    },
    replace(location) {
      replaced = location
    }
  }
  closeDetailDrawer(router)
  assert.deepEqual(replaced, { path: '/assets', hash: undefined, query: { tab: 'all' } })
})

test('background pages never inherit a foreground drawer action', async () => {
  const runtime = await import(
    `data:text/javascript;base64,${Buffer.from(await source('libs/context/runtime.js')).toString('base64')}`
  )
  const f = await fixture('/assets?drawer=AssetDetail&drawerId=A')
  assert.deepEqual(await runtime.getRuntimeActionMeta(f.vm), {})
  assert.equal((await runtime.getRuntimeActionMeta(f.captures.at(-1).vm)).id, 'A')
  f.app.unmount()
})

test('nested local drawers keep their parent context and close only their own stack entry', async () => {
  const f = await fixture('/assets?tab=all&drawer=AssetDetail&drawerId=A&drawerTab=Account')
  const parent = f.captures.at(-1).vm
  parent.nested = true
  await flush()
  const nested = parent.$refs.nested
  nested.onUpdate({ row: { id: 'B' } })
  await flush()
  assert.equal(f.store.state.common.drawerStack.length, 2)
  assert.equal(parent.$context.get('id'), 'A')
  assert.equal(f.captures.at(-1).id, 'B')
  nested.handleDrawerRequestClose()
  await flush()
  assert.equal(f.store.state.common.drawerStack.length, 1)
  assert.equal(f.store.state.common.drawerActionMeta.id, 'A')
  assert.equal(f.vm.drawerVisible, true)
  assert.equal(f.router.currentRoute.value.query.drawerTab, 'Account')
  f.app.unmount()
})

test('URL extras cannot override the detail identity or runtime action', async () => {
  const f = await fixture()
  const route = readDrawerRoute(f.router, {
    query: {
      drawer: 'AssetDetail',
      drawerId: 'A',
      drawerQuery: JSON.stringify({ id: 'B', action: 'update', handlers: 'invalid', scope: 'org' })
    }
  })
  assert.deepEqual(route.location.params, { id: 'A' })
  assert.deepEqual(route.location.query, { scope: 'org' })
  f.app.unmount()
})

test('detail and form pages use their entry context for presentation on first render', async () => {
  const runtime = await import(
    `data:text/javascript;base64,${Buffer.from(await source('libs/context/runtime.js')).toString('base64')}`
  )
  const pagePresentation = await load('layout/components/pagePresentation.js', {
    unref,
    DRAWER_RUNTIME_CONTEXT
  })
  const DetailPage = await load('layout/components/GenericDetailPage/index.vue', {
    TabPage,
    flashErrorMsg() {},
    getApiPath: (_vm, id) => `/objects/${id}/`,
    ActionsGroup: {},
    getRuntimeActionMeta: runtime.getRuntimeActionMeta,
    getRuntimeRoute: runtime.getRuntimeRoute,
    mapGetters,
    pagePresentation,
    _: lodash
  })
  const FormPage = await load('layout/components/GenericCreateUpdatePage/index.vue', {
    IBox: {},
    Page: {},
    pagePresentation,
    GenericCreateUpdateForm: {}
  })
  DetailPage.render = function () {
    return h('div', { 'data-mode': this.presentationMode, 'data-title': this.detailTitle })
  }
  FormPage.render = function () {
    return h('div', {
      'data-mode': this.presentationMode,
      'data-hide-heading': this.pageAttrs.hideHeading
    })
  }
  const requests = []
  let overlay
  const Overlay = {
    mounted() {
      overlay = this
    },
    render() {
      return h('div', [
        h(DetailPage, { ref: 'detail', object: { name: 'Drawer object' }, url: '/objects' }),
        h(FormPage, { ref: 'form', title: 'Edit' })
      ])
    }
  }
  const Root = {
    render() {
      return h('div', [
        h(DetailPage, { ref: 'detail', object: { name: 'Page object' }, url: '/objects' }),
        h(FormPage, { ref: 'form', title: 'Edit' }),
        h(Drawer, {
          visible: true,
          component: Overlay,
          componentProps: { drawerContext: { isDrawer: true, action: 'detail', id: 'B' } }
        })
      ])
    }
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/objects/:id', name: 'ObjectDetail', component: Root }]
  })
  await router.push('/objects/A')
  const app = renderer().createApp(Root)
  app.use(createStore({ getters: { currentOrgIsRoot: () => false } }))
  app.use(router)
  app.use(createContextService({ router }))
  app.config.globalProperties.$hasCurrentResAction = () => true
  app.config.globalProperties.$t = (value) => value
  app.config.globalProperties.$axios = {
    get: async (url) => {
      requests.push(url)
      return {}
    }
  }
  const vm = app.mount({ children: [] })
  await flush()

  assert.equal(vm.$refs.detail.presentationMode, 'page')
  assert.equal(vm.$refs.detail.drawer, false)
  assert.equal(vm.$refs.detail.detailTitle, 'Page object')
  assert.equal(vm.$refs.form.pageAttrs.hideHeading, false)
  assert.equal(overlay.$refs.detail.presentationMode, 'drawer')
  assert.equal(overlay.$refs.detail.drawer, true)
  assert.equal(overlay.$refs.detail.detailTitle, 'Drawer object')
  assert.equal(overlay.$refs.form.pageAttrs.hideHeading, true)
  assert.deepEqual(requests.sort(), ['/objects/A/', '/objects/B/'])
  app.unmount()
})
