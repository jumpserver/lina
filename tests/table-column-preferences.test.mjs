import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { computed, reactive } from 'vue'

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
const storageSource = await read('utils/common/objectLocalStorage.js')
const browser = { localStorage: null }
const ObjectLocalStorage = new Function(
  'window',
  storageSource.replace('export class', 'return class')
)(browser)
const common = await read('utils/common/index.js')
const loadFunction = (name, globals = {}) =>
  new Function(
    ...Object.keys(globals),
    common
      .match(new RegExp(`export function ${name}\\([\\s\\S]*?\\n\\}`))[0]
      .replace('export function', 'return function')
  )(...Object.values(globals))
const hasUUID = loadFunction('hasUUID', { uuidPattern: /[0-9a-zA-Z\-]{36}/ })
const globals = {
  DataTable: {},
  ColumnSettingPopover: {},
  ObjectLocalStorage,
  newURL: loadFunction('newURL', { location: { origin: 'http://localhost' } }),
  replaceAllUUID: loadFunction('replaceAllUUID', { hasUUID }),
  orderActionColumn: (columns) => columns
}
const script = parse(await read('components/Table/AutoDataTable/index.vue')).descriptor.script
  .content
const component = new Function(
  ...Object.keys(globals),
  script.replace(/^import .*$/gm, '').replace('export default', 'return')
)(...Object.values(globals))

function setup(t) {
  const saved = new Map()
  t.mock.property(browser, 'localStorage', {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value)
  })
  const storage = (name) => new ObjectLocalStorage('tableColumns', name)
  const table = (config = {}, routeName = 'CloudAccountList') => {
    const vm = {
      config: reactive(config),
      $route: { name: routeName },
      $log: { debug() {} },
      popoverColumns: {},
      cleanedColumnsShow: { default: ['name', 'actions'] },
      filterShowColumns() {}
    }
    vm.normalizeColumnNames = component.methods.normalizeColumnNames.bind(vm)
    const value = computed(() => component.computed.tableColumnsStorage.call(vm))
    Object.defineProperty(vm, 'tableColumnsStorage', { get: () => value.value })
    vm.save = (columns) => component.methods.handlePopoverColumnsChange.call(vm, { columns })
    return vm
  }
  return { saved, storage, table }
}

test('late-bound lists ignore the shared empty-URL cache and preserve independent preferences', (t) => {
  const { saved, storage, table } = setup(t)
  const legacy = storage('CloudAccountList_undefined')
  legacy.set(['actions'])
  const strategyStorage = storage('CloudAccountList_/api/v1/xpack/cloud/strategies/')
  strategyStorage.set(['priority', 'name', 'actions'])
  const strategy = table({ url: '' })
  const instances = table({ url: '' })
  assert.equal(strategy.tableColumnsStorage, null)
  assert.equal(instances.tableColumnsStorage, null)
  const before = saved.get('tableColumns')
  strategy.save(['name'])
  assert.equal(saved.get('tableColumns'), before)

  strategy.config.url = '/api/v1/xpack/cloud/strategies/?category=database'
  instances.config.url = '/api/v1/xpack/cloud/sync-instance-tasks/instances/?category=database'
  assert.deepEqual(strategy.tableColumnsStorage.get(), ['priority', 'name', 'actions'])
  assert.equal(instances.tableColumnsStorage.get(), undefined)
  instances.save(['instance_id', 'asset_ip', 'region'])
  strategy.save(['actions'])
  assert.deepEqual(instances.tableColumnsStorage.get(), ['instance_id', 'asset_ip', 'region'])
  instances.save(null)
  assert.deepEqual(strategyStorage.get(), ['actions'])
  assert.deepEqual(legacy.get(), ['actions'])
  assert.deepEqual(table({ url: instances.config.url }).tableColumnsStorage.get(), [
    'name',
    'actions'
  ])
})

test('resource changes switch preferences while query changes and UUID paths retain their existing scope', (t) => {
  const { table } = setup(t)
  const vm = table({ url: '/api/v1/users/users/?limit=15' }, 'UserList')
  vm.save(['name', 'username'])
  vm.config.url = '/api/v1/users/users/?limit=30&search=alice'
  assert.deepEqual(vm.tableColumnsStorage.get(), ['name', 'username'])
  vm.config.url = '/api/v1/users/groups/'
  assert.equal(vm.tableColumnsStorage.get(), undefined)
  vm.save(['name', 'users_amount'])
  vm.config.url = ''
  assert.equal(vm.tableColumnsStorage, null)
  vm.config.url = '/api/v1/users/users/'
  assert.deepEqual(vm.tableColumnsStorage.get(), ['name', 'username'])

  vm.config.url = '/api/v1/assets/assets/11111111-1111-1111-1111-111111111111/accounts/'
  vm.save(['username', 'secret_type'])
  vm.config.url = '/api/v1/assets/assets/22222222-2222-2222-2222-222222222222/accounts/'
  assert.deepEqual(vm.tableColumnsStorage.get(), ['username', 'secret_type'])
})

test('explicit table names continue using their existing saved preferences', (t) => {
  const { storage, table } = setup(t)
  storage('asset-picker').set(['name', 'address'])
  const vm = table({ name: 'asset-picker', url: '' })
  assert.deepEqual(vm.tableColumnsStorage.get(), ['name', 'address'])
  vm.config.url = '/api/v1/assets/assets/?node_id=1'
  assert.deepEqual(vm.tableColumnsStorage.get(), ['name', 'address'])
  vm.config.name = 'account-picker'
  assert.equal(vm.tableColumnsStorage.get(), undefined)
  vm.save(['username'])
  assert.deepEqual(storage('asset-picker').get(), ['name', 'address'])
  assert.deepEqual(storage('account-picker').get(), ['username'])
})
