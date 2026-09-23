import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createSSRApp, h, computed, ref, unref } from 'vue'
import { renderToString } from '@vue/server-renderer'

const DRAWER_RUNTIME_CONTEXT = Symbol('drawerRuntimeContext')
const source = await readFile(new URL('../src/libs/context/index.js', import.meta.url), 'utf8')
const createContextService = new Function('DRAWER_RUNTIME_CONTEXT', 'unref',
  source.replace(/^import .*$/gm, '').replace('export default createContextService', 'return createContextService')
)(DRAWER_RUNTIME_CONTEXT, unref)

function reader(read) {
  return { created() { read(this.$context) }, render: () => h('span') }
}

function drawer(id, children) {
  return {
    provide() { return { [DRAWER_RUNTIME_CONTEXT]: { isDrawer: true, action: 'detail', id, params: { id } } } },
    render: () => h('div', children.map((child) => h(child)))
  }
}

test('nested drawers resolve their own IDs without changing the outer context', async () => {
  const seen = []
  const inner = drawer('template-id', [reader((context) => {
    seen.push(context.get('id'))
    assert.equal(context.getScope('overlay').id, 'template-id')
  })])
  const outer = drawer('account-id', [
    reader((context) => seen.push(context.get('id'))), inner,
    reader((context) => seen.push(context.get('id')))
  ])
  const app = createSSRApp(outer)
  app.use(createContextService())
  await renderToString(app)
  assert.deepEqual(seen, ['account-id', 'template-id', 'account-id'])
})

test('view contexts are isolated and route values remain available without a drawer', async () => {
  const seen = []
  const children = [
    reader((context) => { context.set('local', 'first'); seen.push(context.get('local')) }),
    reader((context) => { seen.push(context.get('local')); seen.push(context.get('id')) })
  ]
  const app = createSSRApp({ render: () => h('div', children.map((child) => h(child))) })
  app.use(createContextService({ router: { currentRoute: { value: { name: 'Detail', params: { id: 'route-id' } } } } }))
  await renderToString(app)
  assert.deepEqual(seen, ['first', undefined, 'route-id'])
})


test('reused drawers expose the latest resource rather than the initial context', async () => {
  const context = ref({ isDrawer: true, id: 'old-id' })
  const seen = []
  const app = createSSRApp({
    provide() { return { [DRAWER_RUNTIME_CONTEXT]: computed(() => context.value) } },
    render: () => h(reader((facade) => {
      seen.push(facade.get('id'))
      context.value = { isDrawer: true, id: 'new-id' }
      seen.push(facade.get('id'))
    }))
  })
  app.use(createContextService())
  await renderToString(app)
  assert.deepEqual(seen, ['old-id', 'new-id'])
})
