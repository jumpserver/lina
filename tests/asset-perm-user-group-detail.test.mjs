import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { parse } from '@vue/compiler-sfc'
import { compile, createRenderer, h } from 'vue'
import _ from 'lodash'

async function component(path, imports) {
  const source = await readFile(new URL(`../src/${path}.vue`, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  const script = descriptor.script.content
    .replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const options = compileFunction(script, Object.keys(imports))(...Object.values(imports))
  return { ...options, render: compile(descriptor.template.content) }
}

const renderer = createRenderer({
  createComment: () => ({}),
  createText: () => ({}),
  createElement: () => ({}),
  setElementText() {},
  patchProp() {},
  insert(node, parent) {
    node.parent = parent
  },
  parentNode: (node) => node.parent,
  nextSibling: () => null,
  remove() {}
})

test('opening groups from asset details requests the selected group each time', async () => {
  const assetId = 'parent-asset'
  const card = await component('views/assets/Asset/AssetDetail/components/PermUserGroupCard', {
    IBox: {},
    Drawer: {}
  })
  const detail = await component('layout/components/GenericDetailPage/index', {
    TabPage: {},
    ActionsGroup: {},
    _,
    mapGetters: () => ({}),
    getRuntimeActionMeta: () => ({ action: 'detail', id: assetId })
  })
  detail.render = () => null
  const group = await component('views/users/Group/UserGroupDetail/index', {
    GenericDetailPage: detail,
    GroupInfo: {},
    GroupUser: {}
  })
  const requests = []
  const cardVm = { $route: { name: 'AssetDetail' }, detailRoute: group }
  for (const id of ['group-a', 'group-b']) {
    card.methods.goDetail.call(cardVm, { id })
    const app = renderer.createApp(cardVm.detailDrawer, cardVm.detailDrawerProps)
    Object.assign(app.config.globalProperties, {
      $route: cardVm.$route,
      $hasCurrentResAction: () => true,
      $t: (key) => key,
      $axios: {
        async get(url) {
          requests.push(url)
          return { id }
        }
      }
    })
    app.mount({})
    await new Promise((resolve) => setImmediate(resolve))
    app.unmount()
  }
  assert.deepEqual(requests, ['/api/v1/users/groups/group-a/', '/api/v1/users/groups/group-b/'])
})

for (const routeName of ['AssetDetail', 'AssetList']) {
  test(`group actions from ${routeName} edit the selected group and delete in place`, async () => {
    const card = await component('views/assets/Asset/AssetDetail/components/PermUserGroupCard', {
      IBox: {},
      Drawer: {}
    })
    const group = { id: 'group-b', name: 'Selected group', users: ['member'] }
    const url = '/api/v1/users/groups/group-b/'
    const permissions = new Set(['assets.change_asset', 'assets.delete_asset'])
    const routes = []
    const deleted = []
    const refreshed = []
    const errors = []
    let confirmed = false
    let deleteFails = false
    const cardVm = {
      ...card.methods,
      $route: { name: routeName, params: { id: 'parent-asset' } },
      $router: { push: (route) => routes.push(route) },
      $store: { getters: { currentOrgIsRoot: false } },
      $hasPerm: (permission) => permissions.has(permission),
      $t: (key) => key,
      $message: { success() {}, error: (message) => errors.push(message) },
      $confirm: async () => {
        if (!confirmed) throw 'cancel'
      },
      $axios: {
        async delete(requestUrl) {
          if (deleteFails) throw new Error('delete failed')
          deleted.push(requestUrl)
        }
      },
      loadObjects: () => refreshed.push('groups'),
      $emit: (event) => refreshed.push(event)
    }
    cardVm.goDetail(group)
    const { actions } = cardVm.detailDrawerProps
    const allowed = (value) => (typeof value === 'function' ? value() : value)
    assert.equal(allowed(actions.canUpdate), false)
    assert.equal(allowed(actions.canDelete), false)
    permissions.add('users.change_usergroup')
    permissions.add('users.delete_usergroup')
    cardVm.goDetail(group)
    const withGroupPerms = cardVm.detailDrawerProps.actions
    assert.equal(allowed(withGroupPerms.canUpdate), true)
    assert.equal(allowed(withGroupPerms.canDelete), true)
    cardVm.$store.getters.currentOrgIsRoot = true
    cardVm.goDetail(group)
    assert.equal(allowed(cardVm.detailDrawerProps.actions.canUpdate), false)
    assert.equal(allowed(cardVm.detailDrawerProps.actions.canDelete), true)
    cardVm.$store.getters.currentOrgIsRoot = false

    withGroupPerms.updateCallback()
    assert.deepEqual(routes, [{ name: 'UserGroupUpdate', params: { id: group.id } }])
    assert.equal(cardVm.drawerVisible, false)
    assert.deepEqual(refreshed, [])

    cardVm.goDetail(group)
    const { deleteCallback } = cardVm.detailDrawerProps.actions
    await deleteCallback()
    assert.deepEqual(deleted, [])
    assert.deepEqual(refreshed, [])
    assert.equal(cardVm.drawerVisible, true)
    confirmed = true
    deleteFails = true
    await deleteCallback()
    assert.deepEqual(errors, ['delete failed'])
    assert.deepEqual(refreshed, [])
    assert.equal(cardVm.drawerVisible, true)
    deleteFails = false
    await deleteCallback()
    assert.deepEqual(deleted, [url])
    assert.deepEqual(refreshed, ['group-deleted', 'groups'])
    assert.equal(cardVm.drawerVisible, false)
  })
}

test('a deleted group refreshes the asset’s authorized users table', async () => {
  let cardVm
  let reloads = 0
  const parent = await component('views/assets/Asset/AssetDetail/PermUser', {
    TwoCol: {
      render() {
        return h('div', [...this.$slots.default(), ...this.$slots.right()])
      }
    },
    ListTable: {
      methods: {
        reloadTable() {
          reloads++
        }
      },
      render: () => null
    },
    GenericListTableDialog: { render: () => null },
    DetailFormatter: {},
    PermUserGroupCard: {
      emits: ['group-deleted'],
      render() {
        cardVm = this
        return null
      }
    }
  })
  const app = renderer.createApp(parent, { object: { id: 'parent-asset' } })
  Object.assign(app.config.globalProperties, { $hasPerm: () => true, $t: (key) => key })
  app.mount({})
  cardVm.$emit('group-deleted')
  assert.equal(reloads, 1)
  app.unmount()
})

test('the group edit page permits its own name and rejects another group’s name', async () => {
  const groups = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Selected' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Other' }
  ]
  const [selected, other] = groups
  const ruleSource = await readFile(
    new URL('../src/components/Form/DataForm/rules/index.js', import.meta.url),
    'utf8'
  )
  const script = ruleSource
    .replace(/^import .*$/gm, '')
    .replace('export default', 'const defaultRules =')
    .replace(/^export /gm, '')
  const t = (key) => key
  const edit = await component('views/users/Group/UserGroupCreateUpdate', {
    ResourceSelect: {},
    GenericCreateUpdatePage: {}
  })
  const { config } = edit.data.call({ $t: t })
  const requests = []
  const UniqueCheck = compileFunction(`${script}\nreturn UniqueCheck`, ['i18n', 'request'])(
    { t },
    {
      async get(url, { params }) {
        requests.push(url)
        return groups.filter((group) => group.name === params.name)
      }
    }
  )
  const form = await component('components/Form/AutoDataForm/index', {
    DataForm: {},
    FormGroupHeader: {},
    UniqueCheck
  })
  const field = { prop: 'name', ...config.fieldsMeta.name }
  form.methods.applyUniqueRules.call({
    $route: { name: 'UserGroupUpdate', params: { id: selected.id } },
    form: selected,
    url: `${config.url}${selected.id}/`,
    totalFields: [field]
  })
  const validate = (value) => new Promise((resolve) => field.rules[0].validator({}, value, resolve))
  assert.equal(await validate(selected.name), undefined)
  assert.match((await validate(other.name)).message, /Existing/)
  assert.deepEqual(requests, [config.url, config.url])
  assert.equal(config.getNextRoute(selected, 'put').name, 'UserGroupDetail')
  assert.equal(config.objectDetailRoute.name, 'UserGroupDetail')
})
