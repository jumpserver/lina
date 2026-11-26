import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import _ from 'lodash'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/users/Role/RoleDetail/RoleInfo.vue', import.meta.url),
  'utf8'
)
const reports = await readFile(
  new URL('../src/views/reports/center/permissions.js', import.meta.url),
  'utf8'
)
const { auditReportPermissions } = await import(
  `data:text/javascript;base64,${Buffer.from(reports).toString('base64')}`
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const component = new Function(
  'IBox',
  'AutoDetailCard',
  'AutoDataZTree',
  'TwoCol',
  '_',
  'auditReportPermissions',
  script
)({}, {}, {}, {}, _, auditReportPermissions)

function fixture(checked = []) {
  const root = { title: '$ROOT$', children: [] }
  const nodes = new Map([[root.title, root]])
  function add(title, parentTitle = '$ROOT$') {
    const parent = nodes.get(parentTitle)
    parent.isParent = true
    const node = {
      id: title,
      title,
      children: [],
      checked: checked.includes(title),
      getParentNode: () => parent,
      getPath: () => [...(parent.getPath?.() || [parent]), node]
    }
    parent.children.push(node)
    nodes.set(title, node)
  }
  add('view_workbench')
  for (const title of ['rbac.view_webterminal', 'rbac.view_workbench', 'rbac.view_filemanager']) {
    add(title, 'view_workbench')
  }
  add('authentication.connectiontoken')
  for (const action of ['view', 'add', 'expire', 'reuse']) {
    add(`authentication.${action}_connectiontoken`, 'authentication.connectiontoken')
  }
  add('assets')
  for (const resource of ['asset', 'platform', 'node']) {
    add(`assets.${resource}`, 'assets')
    for (const action of ['view', 'add', 'change', 'delete', 'match']) {
      add(`assets.${action}_${resource}`, `assets.${resource}`)
    }
  }
  add('perms.view_myassets')
  add('perms.view_assetpermission')
  add('rbac.view_audit')
  add('rbac.view_auditreport')
  const flatten = (list) => list.flatMap((node) => [node, ...flatten(node.children)])
  function updateParents(node) {
    for (let parent = node.getParentNode?.(); parent; parent = parent.getParentNode?.()) {
      parent.checked = parent.children.some((child) => child.checked)
    }
  }
  for (const node of [...nodes.values()].reverse()) updateParents(node)
  const tree = {
    getNodes: () => [root],
    transformToArray: flatten,
    getCheckedNodes: () => [...nodes.values()].filter((node) => node.checked),
    getNodeByParam: (key, value) => [...nodes.values()].find((node) => node[key] === value),
    checkNode(node, value, cascade) {
      if (node.chkDisabled) return
      node.checked = value
      if (cascade) {
        for (const child of node.children) tree.checkNode(child, value, true)
        updateParents(node)
      }
    }
  }
  const vm = {
    object: { id: 'test-role', scope: { value: 'org' } },
    $refs: { tree: { zTree: tree } },
    ztree: tree,
    $hasPerm: () => true,
    $tc: (s) => s,
    $log: { debug() {}, error() {} },
    $message: { success() {}, error() {} },
    $axios: {
      patch(url, data) {
        vm.saved = { url, data }
        return Promise.resolve()
      }
    }
  }
  Object.assign(vm, component.data.call(vm))
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  return {
    vm,
    nodes,
    check(title, value) {
      const node = nodes.get(title)
      tree.checkNode(node, value, true)
      vm.setting.callback.onCheck(null, 'test-tree', node)
    },
    selected: () =>
      tree
        .getCheckedNodes()
        .filter((node) => !node.isParent)
        .map((node) => node.title)
        .sort()
  }
}

test('Web terminal can be removed and saved while other workbench and connection permissions remain', () => {
  const f = fixture()
  f.check('view_workbench', true)
  f.check('rbac.view_webterminal', false)
  assert.equal(f.nodes.get('rbac.view_webterminal').checked, false)
  assert.equal(f.nodes.get('rbac.view_filemanager').checked, true)
  assert.equal(f.nodes.get('authentication.add_connectiontoken').checked, true)
  f.check('rbac.view_audit', true)
  assert.equal(f.nodes.get('rbac.view_webterminal').checked, false)
  f.vm.updatePermissions()
  assert.equal(f.vm.saved.url, '/api/v1/rbac/org-roles/test-role/')
  assert.deepEqual(f.vm.saved.data.permissions.sort(), f.selected())
  assert.ok(!f.vm.saved.data.permissions.includes('rbac.view_webterminal'))
})

test('connection permissions alone do not enable the Web terminal entry', () => {
  const f = fixture()
  f.check('authentication.add_connectiontoken', true)
  assert.equal(f.nodes.get('rbac.view_webterminal').checked, false)
  assert.equal(f.nodes.get('authentication.view_connectiontoken').checked, true)
})

test('a single selection completes transitive dependencies', () => {
  const f = fixture()
  f.check('perms.view_assetpermission', true)
  assert.deepEqual(f.selected(), [
    'assets.view_asset',
    'assets.view_node',
    'assets.view_platform',
    'perms.view_assetpermission'
  ])
})

test('removing a dependency removes all dependent permissions without rechecking them', () => {
  const f = fixture()
  f.check('perms.view_assetpermission', true)
  f.check('assets.change_asset', true)
  f.check('rbac.view_audit', true)
  f.check('assets.view_platform', false)
  assert.deepEqual(f.selected(), ['rbac.view_audit'])
})

test('removing a group also removes permissions outside the group that depend on its children', () => {
  const f = fixture()
  f.check('perms.view_assetpermission', true)
  f.check('assets', false)
  assert.deepEqual(f.selected(), [])
})

test('removing a group dependency revokes its checked descendants, including a partially checked group', () => {
  const f = fixture()
  f.check('rbac.view_webterminal', true)
  assert.equal(f.nodes.get('authentication.add_connectiontoken').checked, true)
  f.check('authentication.add_connectiontoken', false)
  assert.equal(f.nodes.get('rbac.view_webterminal').checked, false)
  assert.equal(f.nodes.get('view_workbench').checked, false)
})

test('ordinary action/view dependencies work for group selections and preserve independent match permissions', () => {
  const f = fixture()
  f.check('assets.asset', true)
  f.check('assets.view_asset', false)
  assert.equal(f.nodes.get('assets.change_asset').checked, false)
  assert.equal(f.nodes.get('assets.delete_asset').checked, false)
  assert.equal(f.nodes.get('assets.match_asset').checked, true)
  assert.equal(f.nodes.get('assets.asset').checked, true)
})

test('rapid changes and an immediate save retain every selection and its dependencies', () => {
  const f = fixture()
  f.check('assets.add_node', true)
  f.check('rbac.view_auditreport', true)
  f.vm.updatePermissions()
  assert.ok(f.vm.saved.data.permissions.includes('assets.view_platform'))
  assert.ok(f.vm.saved.data.permissions.includes('assets.view_node'))
  assert.ok(f.vm.saved.data.permissions.includes('rbac.view_audit'))
})

test('dependency cycles terminate and missing permission nodes are ignored', () => {
  const f = fixture()
  f.vm.nodesDeps['assets.view_platform'] = ['assets.view_asset', 'missing.permission']
  f.check('assets.view_asset', true)
  assert.deepEqual(f.selected(), ['assets.view_asset', 'assets.view_platform'])
  f.check('assets.view_platform', false)
  assert.deepEqual(f.selected(), [])
})

test('disabled permissions are not changed by dependency handling', () => {
  const f = fixture(['rbac.view_auditreport'])
  f.nodes.get('rbac.view_auditreport').chkDisabled = true
  f.check('rbac.view_audit', true)
  f.check('rbac.view_audit', false)
  assert.equal(f.nodes.get('rbac.view_auditreport').checked, true)
})
