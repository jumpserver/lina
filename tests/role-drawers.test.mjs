import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import _ from 'lodash'
import * as Vue from 'vue'
import { compileTemplate, parse } from '@vue/compiler-sfc'

const read = (path) => readFile(new URL('../src/' + path, import.meta.url), 'utf8')

async function component(path, imports) {
  const { descriptor } = parse(await read(path))
  const options = new Function(
    ...Object.keys(imports),
    descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
  )(...Object.values(imports))
  const { code, errors } = compileTemplate({
    source: descriptor.template.content,
    filename: path,
    id: path,
    compilerOptions: { mode: 'function' }
  })
  assert.deepEqual(errors, [])
  return { ...options, render: new Function('Vue', code)(Vue) }
}

// Mount the real list and drawer without a browser or an API server.
const renderer = Vue.createRenderer({
  createElement: () => ({ children: [] }),
  createText: () => ({}),
  createComment: () => ({}),
  insert(node, parent, anchor) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = parent
    const index = parent.children.indexOf(anchor)
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
  },
  remove(node) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = null
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1],
  setText() {},
  setElementText() {},
  patchProp() {}
})
const key = Symbol('drawer')
const Drawer = await component('components/Drawer/index.vue', {
  DRAWER_RUNTIME_CONTEXT: key,
  TAB_NAVIGATION_CONTEXT: Symbol(),
  TAB_NAVIGATION_SCOPE: {},
  useDrawerResize: () => ({}),
  getStoredDrawerWidth: () => '50%',
  resolveAsyncComponentCompat: (value) => value
})
const DrawerList = await component('components/Table/DrawerListTable/index.vue', {
  ListTable: { render: () => null },
  Drawer,
  markRaw: Vue.markRaw,
  toRaw: Vue.toRaw,
  mapGetters: () => ({}),
  resolveRoute: () => null,
  toLowerCaseExcludeAbbr: (text) => text,
  _
})

const context = new Function(
  'DRAWER_RUNTIME_CONTEXT',
  (await read('libs/context/index.js'))
    .replace(/^import .*$/gm, '')
    .replace('export default createContextService', 'return createContextService')
)(key)
const runtime = new Function(
  (await read('libs/context/runtime.js')).replaceAll('export ', '') +
    '\nreturn getRuntimeActionMeta'
)()

function mount(view, props, globals = {}) {
  const app = renderer.createApp(view, props)
  app.use(context())
  app.directive('loading', {})
  Object.assign(app.config.globalProperties, {
    $log: { debug() {} },
    $t: (key) => key,
    $hasPerm: () => true,
    $route: { name: 'RoleList', meta: { title: 'Roles' }, params: {}, query: {} },
    $store: { dispatch() {} },
    ...globals
  })
  app.component('ElDrawer', {
    inheritAttrs: false,
    props: ['modelValue'],
    render() {
      return this.modelValue ? this.$slots.default() : null
    }
  })
  return { vm: app.mount({ children: [] }), unmount: () => app.unmount() }
}

async function mountRoleList(t, scope) {
  const requests = []
  const forms = []
  const submissions = []
  let submit
  const form = await component('layout/components/GenericCreateUpdateForm/index.vue', {
    AutoDataForm: {
      inheritAttrs: false,
      props: ['form', 'method', 'url'],
      emits: ['submit'],
      mounted() {
        forms.push([this.method, this.url, this.form.name])
        submit = (name) => this.$emit('submit', { name })
      },
      render: () => null
    },
    getUpdateObjURL: (url, id) => url + id + '/',
    getRuntimeActionMeta: runtime,
    _
  })
  // The toast and navigation after a successful request are outside this fixture.
  form.props.onPerformSuccess.default = () => {}
  const createPage = await component('views/users/Role/RoleCreateUpdate.vue', {
    GenericCreateUpdatePage: form,
    TextReadonly: {}
  })
  const detail = await component('layout/components/GenericDetailPage/index.vue', {
    TabPage: {
      render() {
        return Vue.h('div', this.$slots.default())
      }
    },
    ActionsGroup: { render: () => null },
    mapGetters: () => ({}),
    getRuntimeActionMeta: runtime,
    _
  })
  const roleDetail = await component('views/users/Role/RoleDetail/index.vue', {
    GenericDetailPage: detail,
    RoleInfo: { render: () => null },
    RoleUsers: { render: () => null }
  })
  const row = { id: 'role-A', name: 'Existing role', scope: { value: scope } }
  const { vm, unmount } = mount(
    DrawerList,
    {
      tableConfig: {},
      headerActions: {},
      createDrawer: () => Vue.h(createPage),
      detailDrawer: () => Vue.h(roleDetail)
    },
    {
      $hasCurrentResAction: () => true,
      $axios: {
        async get(url) {
          requests.push(url)
          return row
        },
        async post(url, data) {
          submissions.push(['POST', url, data.name])
          return data
        },
        async put(url, data) {
          submissions.push(['PUT', url, data.name])
          return data
        }
      }
    }
  )
  t.after(unmount)
  return {
    vm,
    row,
    query: { scope },
    url: `/api/v1/rbac/${scope}-roles/`,
    requests,
    forms,
    submissions,
    submit: (name) => submit(name)
  }
}
const settle = () => new Promise((resolve) => setImmediate(resolve))

test('creating after editing a system role submits a new role without its old name or ID', async (t) => {
  const { vm, row, query, url, requests, forms, submissions, submit } = await mountRoleList(
    t,
    'system'
  )
  await vm.onUpdate({ row, query })
  await settle()
  vm.drawerVisible = false
  await Vue.nextTick()
  await vm.onCreate({ query })
  await settle()
  submit('Second role')
  assert.deepEqual(submissions, [['POST', url, 'Second role']])
  assert.deepEqual(forms, [
    ['put', url + row.id + '/', row.name],
    ['post', url, undefined]
  ])
  assert.deepEqual(requests, [url + row.id + '/'])
})

test('opening details and editing after creating an organization role uses the selected ID', async (t) => {
  const { vm, row, query, url, requests, forms, submissions, submit } = await mountRoleList(
    t,
    'org'
  )
  await vm.onCreate({ query })
  await settle()
  submit(row.name)
  vm.drawerVisible = false
  await Vue.nextTick()
  await vm.onDetail({ row, detailRoute: { params: { id: row.id }, query } })
  await settle()
  await vm.onUpdate({ row, query })
  await settle()
  assert.deepEqual(submissions, [['POST', url, row.name]])
  assert.deepEqual(requests, [url + row.id + '/', url + row.id + '/'])
  assert.deepEqual(forms, [
    ['post', url, undefined],
    ['put', url + row.id + '/', row.name]
  ])
})

test('role detail mounts its tabs only when the role has been loaded', async (t) => {
  const roles = []
  const RoleInfo = {
    inheritAttrs: false,
    props: ['object'],
    created() {
      roles.push(this.object.scope.value)
    },
    render: () => null
  }
  const page = await component('views/users/Role/RoleDetail/index.vue', {
    GenericDetailPage: {
      inheritAttrs: false,
      render() {
        return this.$slots.default()
      }
    },
    RoleInfo,
    RoleUsers: RoleInfo
  })
  const { vm, unmount } = mount(page)
  t.after(unmount)
  assert.deepEqual(roles, [])
  assert.equal(vm.config.actions.canUpdate(), false)
  vm.role = { id: 'role-A', scope: { value: 'system' } }
  await Vue.nextTick()
  assert.deepEqual(roles, ['system'])
  assert.equal(vm.config.actions.canUpdate(), true)
})
