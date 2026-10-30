import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import lodash from 'lodash'

const readSource = (path) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
const legacySource = await readSource('router/settings/legacy-mcp.js')
const { redirectLegacyMCPSettings } = await import(
  `data:text/javascript;base64,${Buffer.from(legacySource).toString('base64')}`
)
const permissionSource = await readSource('utils/jms/permission.js')
const { checkPermission, getResourceNameByPath } = new Function(
  permissionSource.replace(/^import .*$/gm, '').replaceAll('export function', 'function') +
    '\nreturn { checkPermission, getResourceNameByPath }'
)()
const filterSource = await readSource('store/modules/permission.js')
const makeFilter = (perms) =>
  new Function(
    'getResourceNameByPath',
    'hasPermission',
    'i18n',
    '_',
    filterSource
      .slice(0, filterSource.indexOf('const state ='))
      .replace(/^import .*$/gm, '')
      .replaceAll('export function', 'function') + '\nreturn filterPermedRoutes'
  )(
    getResourceNameByPath,
    (required) => checkPermission(required, perms),
    { global: { t: (key) => key } },
    lodash
  )

async function loadRoutes(path) {
  const source = await readSource(path)
  return new Function(
    'i18n',
    'empty',
    'store',
    'openJDMC',
    'getFirstAccessibleChildPath',
    'redirectLegacyMCPSettings',
    source.replace(/^import .*$/gm, '').replace('export default', 'return')
  )(
    { t: (key) => key },
    {},
    {},
    () => {},
    () => '/404',
    redirectLegacyMCPSettings
  )
}

async function routerFor(perms) {
  const settings = makeFilter(['settings.view_setting', ...perms])([
    await loadRoutes('router/settings/index.js')
  ])
  const common = (await loadRoutes('router/common.js')).filter(
    (route) => route.name === 'LegacyMCPSettings'
  )
  const routes = [
    ...common,
    ...settings,
    { path: '/403', name: 'Forbidden', component: {} },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: {} }
  ]
  const stubComponents = (route) => ({
    ...route,
    ...(route.component ? { component: {} } : {}),
    ...(route.children ? { children: route.children.map(stubComponents) } : {})
  })
  return createRouter({ history: createMemoryHistory(), routes: routes.map(stubComponents) })
}

test('AI assistant route accepts either independent settings permission', async () => {
  for (const perms of [
    ['settings.change_chatai'],
    ['settings.change_auth'],
    ['settings.change_chatai', 'settings.change_auth'],
    []
  ]) {
    const router = await routerFor(perms)
    assert.equal(
      router.resolve('/settings/chat-ai').name,
      perms.length ? 'ChatAISettings' : 'NotFound'
    )
  }
})

test('legacy MCP links work with and without the Feature route', async () => {
  for (const perms of [
    ['settings.change_auth'],
    ['settings.change_chatai'],
    ['settings.change_auth', 'settings.change_announcement']
  ]) {
    const router = await routerFor(perms)
    const expected = perms.includes('settings.change_announcement')
      ? 'Feature'
      : 'LegacyMCPSettings'
    assert.equal(router.resolve('/settings/features?tab=MCP').name, expected)
    await router.push('/settings/features?tab=mCp&marker=kept#details')
    assert.equal(router.currentRoute.value.name, 'ChatAISettings')
    assert.deepEqual(router.currentRoute.value.query, { tab: 'MCP', marker: 'kept' })
    assert.equal(router.currentRoute.value.hash, '#details')
    await router.push('/settings/chat-ai?tab=Chat')
    await router.push('/settings/features?tab=MCP')
    assert.equal(router.currentRoute.value.fullPath, '/settings/chat-ai?tab=MCP')
  }
})

test('Feature tabs retain their URLs and do not grant access through MCP permission', async () => {
  const announcement = await routerFor(['settings.change_announcement'])
  await announcement.push('/settings/features?tab=Announcement&marker=kept')
  assert.equal(announcement.currentRoute.value.name, 'Feature')
  assert.deepEqual(announcement.currentRoute.value.query, { tab: 'Announcement', marker: 'kept' })

  const mcp = await routerFor(['settings.change_auth'])
  await mcp.push('/settings/features?tab=Announcement')
  assert.equal(mcp.currentRoute.value.name, 'Forbidden')

  const neither = await routerFor([])
  await neither.push('/settings/features?tab=MCP')
  assert.equal(neither.currentRoute.value.name, 'NotFound')
})

test('legacy fallback lets startup install authorized Feature routes before redirecting', async () => {
  const common = (await loadRoutes('router/common.js')).find(
    (route) => route.name === 'LegacyMCPSettings'
  )
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { ...common, component: {} },
      { path: '/403', name: 'Forbidden', component: {} }
    ]
  })
  let initialized = false
  router.beforeEach((to) => {
    if (initialized) return
    initialized = true
    router.addRoute({
      path: '/settings/features',
      name: 'Feature',
      component: {},
      beforeEnter: redirectLegacyMCPSettings
    })
    return to.fullPath
  })
  await router.push('/settings/features?tab=Announcement')
  assert.equal(router.currentRoute.value.name, 'Feature')
  assert.equal(router.currentRoute.value.query.tab, 'Announcement')
})
