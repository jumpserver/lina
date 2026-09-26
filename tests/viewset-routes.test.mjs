import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import lodash from 'lodash'

const helperSource = await readFile(new URL('../src/router/viewset.js', import.meta.url), 'utf8')
const { createViewSetRoutes } = await import(
  `data:text/javascript;base64,${Buffer.from(helperSource).toString('base64')}`
)
const routeSource = await readFile(
  new URL('../src/router/console/users.js', import.meta.url),
  'utf8'
)
const userRoutes = new Function(
  'empty',
  'createViewSetRoutes',
  routeSource.replace(/^import .*$/gm, '').replace('export default', 'return')
)({}, createViewSetRoutes)

async function loadConsoleRoutes(file, extraImports = {}) {
  const source = await readFile(
    new URL(`../src/router/console/${file}.js`, import.meta.url),
    'utf8'
  )
  const imports = {
    i18n: { t: (key) => key, tc: (key) => key },
    empty: {},
    createViewSetRoutes,
    ...extraImports
  }
  return new Function(
    ...Object.keys(imports),
    source.replace(/^import .*$/gm, '').replace('export default', 'return')
  )(...Object.values(imports))
}

test('user and group viewsets keep existing names, URLs, actions, and page components', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/console/users', component: {}, children: userRoutes }]
  })
  for (const [resource, segment] of [
    ['User', 'users'],
    ['UserGroup', 'groups']
  ]) {
    for (const [path, suffix, action] of [
      ['', 'List', 'list'],
      ['/create', 'Create', 'create'],
      ['/example-id/update', 'Update', 'update'],
      ['/example-id', 'Detail', 'retrieve']
    ]) {
      const route = router.resolve(`/console/users/${segment}${path}`)
      const record = route.matched.at(-1)
      assert.equal(route.name, `${resource}${suffix}`)
      assert.equal(record.meta.title, `${resource}${suffix}`)
      assert.equal(record.meta.action, action)
    }
    const children = userRoutes.find((route) => route.path === segment).children
    assert.equal(children[0].hidden, undefined)
    assert.equal(
      children.slice(1).every((route) => route.hidden),
      true
    )
    assert.equal(children[1].component, children[2].component)
  }
  assert.deepEqual(userRoutes[1].children[0].meta.permissions, ['users.view_usergroup'])
})

test('viewsets can omit actions that a resource does not support', () => {
  const routes = createViewSetRoutes({ name: 'ReadOnly', list: () => {}, detail: () => {} })
  assert.deepEqual(
    routes.map(({ name, path }) => [name, path]),
    [
      ['ReadOnlyList', ''],
      ['ReadOnlyDetail', ':id']
    ]
  )
})

test('additional viewsets preserve standard paths, names, titles, and special metadata', async () => {
  const cases = [
    {
      file: 'labels',
      segment: 'labels',
      name: 'Label',
      titles: ['TagList', 'TagCreate', 'TagUpdate']
    },
    {
      file: 'perms',
      segment: 'asset-permissions',
      name: 'AssetPermission',
      titles: [
        'AssetPermission',
        'AssetPermissionCreate',
        'AssetPermissionUpdate',
        'AssetPermissionDetail'
      ],
      extraImports: { ACLsMenus: [] }
    },
    {
      file: 'accounts',
      segment: 'account-template',
      name: 'AccountTemplate',
      titles: [
        'AccountTemplateList',
        'CreateAccountTemplate',
        'UpdateAccountTemplate',
        'AccountTemplate'
      ]
    },
    {
      file: 'assets',
      segment: 'zones',
      name: 'Zone',
      titles: ['ZoneList', 'ZoneCreate', 'ZoneUpdate', 'Zone'],
      extraImports: { XPackRoutes: [] }
    }
  ]
  const actions = [
    ['', 'List', 'list'],
    ['create', 'Create', 'create'],
    [':id/update', 'Update', 'update'],
    [':id', 'Detail', 'retrieve']
  ]

  for (const { file, segment, name, titles, extraImports } of cases) {
    const routes = await loadConsoleRoutes(file, extraImports)
    const children = routes.find((route) => route.path === segment).children
    assert.deepEqual(
      children.map(({ path, name: routeName, meta }, index) => [
        path,
        routeName,
        meta.action,
        meta.title,
        children[index].hidden
      ]),
      actions
        .slice(0, titles.length)
        .map(([path, suffix, action], index) => [
          path,
          `${name}${suffix}`,
          action,
          titles[index],
          index === 0 ? undefined : true
        ])
    )
    assert.equal(children[1].component, children[2].component)
  }

  const permissionRoutes = await loadConsoleRoutes('perms', { ACLsMenus: [] })
  assert.deepEqual(
    permissionRoutes[0].children.map(({ meta }) => meta.permissions),
    [
      ['perms.view_assetpermission'],
      ['perms.add_assetpermission'],
      ['perms.change_assetpermission'],
      ['perms.view_assetpermission']
    ]
  )
  const accountRoutes = await loadConsoleRoutes('accounts')
  const templateList = accountRoutes.find((route) => route.path === 'account-template').children[0]
  assert.equal(templateList.meta.menuTitle, 'MenuAccountTemplates')
  assert.deepEqual(templateList.meta.permissions, ['accounts.view_accounttemplate'])
})

test('ACL viewsets keep every direct URL and their navigation exceptions', async () => {
  const routes = await loadConsoleRoutes('acls')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/console/perms', component: {}, children: routes }]
  })
  const groups = [
    ['login-acls', 'UserLoginACL'],
    ['cmd-acls', 'CommandFilterACL'],
    ['login-asset-acls', 'AssetACL'],
    ['data-masking-rules', 'DataMaskingRule'],
    ['clipboard-acls', 'ClipboardACL'],
    ['cmd-groups', 'CommandGroup'],
    ['connect-method-acls', 'ConnectMethodACL']
  ]
  const actionPaths = [
    ['', 'List'],
    ['create', 'Create'],
    [':id/update', 'Update'],
    [':id', 'Detail']
  ]

  for (const [segment, name] of groups) {
    const parent = routes[0].children.find((route) => route.path === segment)
    assert.deepEqual(
      parent.children.map(({ path, name }) => [path, name]),
      actionPaths.map(([path, suffix]) => [path, `${name}${suffix}`])
    )
    assert.equal(parent.children[1].component, parent.children[2].component)
    for (const [path, suffix] of actionPaths) {
      const concretePath = path.replace(':id', 'example-id')
      const resolved = router.resolve(`/console/perms/acls/${segment}/${concretePath}`)
      assert.equal(resolved.name, `${name}${suffix}`)
    }
    assert.equal(
      parent.children[0].hidden,
      ['CommandFilterACL', 'CommandGroup'].includes(name) ? true : undefined
    )
    assert.equal(
      parent.children.slice(1).every(({ hidden }) => hidden),
      true
    )
    assert.equal(
      parent.children.every(
        ({ meta }) =>
          meta.activeMenu === '' ||
          (name === 'CommandGroup' && meta.activeMenu === '/console/perms/acls/cmd-acls')
      ),
      true
    )
  }

  const getAction = (segment, action) =>
    routes[0].children
      .find((route) => route.path === segment)
      .children.find((route) => route.name.endsWith(action))
  assert.equal(getAction('login-acls', 'List').meta.title, 'UserLoginACLs')
  assert.equal(getAction('cmd-acls', 'List').meta.menuTitle, 'CommandFilter')
  assert.equal(getAction('data-masking-rules', 'Create').meta.title, '')
  assert.equal(getAction('data-masking-rules', 'Update').meta.title, '')
  assert.equal(getAction('data-masking-rules', 'Detail').meta.title, 'AssetACLDetail')
  assert.deepEqual(
    ['app', 'resource'].map((key) => getAction('login-acls', 'Detail').meta[key]),
    ['acls', 'loginacl']
  )
  assert.equal(getAction('connect-method-acls', 'Create').meta.title, 'ConnectMethodAclCreate')
})

test('generated user actions retain the permission checks of explicit routes', async () => {
  const permissionSource = await readFile(
    new URL('../src/store/modules/permission.js', import.meta.url),
    'utf8'
  )
  const filterPermedRoutes = new Function(
    'getResourceNameByPath',
    'hasPermission',
    'i18n',
    '_',
    permissionSource
      .slice(0, permissionSource.indexOf('const state ='))
      .replace(/^import .*$/gm, '')
      .replaceAll('export function', 'function') + '\nreturn filterPermedRoutes'
  )(
    (value) => value,
    () => true,
    { global: { t: (value) => value } },
    lodash
  )
  const userChildren = userRoutes.find((route) => route.path === 'users').children
  const filtered = filterPermedRoutes(userChildren, {
    meta: { level: 3, fullPath: '/console/users/users', app: 'users', resource: 'user' }
  })
  assert.deepEqual(
    filtered.map(({ meta }) => meta.permissions),
    [['users.view_user'], ['users.add_user'], ['users.change_user'], ['users.view_user']]
  )
})
