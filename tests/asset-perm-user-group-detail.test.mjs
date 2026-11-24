import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { compile, createRenderer } from 'vue'
import _ from 'lodash'

async function component(path, imports) {
  const source = await readFile(new URL(`../src/${path}.vue`, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  const script = descriptor.script.content
    .replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const options = new Function(...Object.keys(imports), script)(...Object.values(imports))
  return { ...options, render: compile(descriptor.template.content) }
}

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
  const renderer = createRenderer({
    createComment: () => ({}),
    insert(node, parent) {
      node.parent = parent
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
    remove() {}
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
