import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import lodash from 'lodash'

const source = await readFile(
  new URL('../src/layout/components/GenericCreateUpdateForm/index.vue', import.meta.url),
  'utf8'
)
const commonSource = await readFile(
  new URL('../src/utils/common/index.js', import.meta.url),
  'utf8'
)
const getUpdateObjURL = new Function(
  'location',
  commonSource.match(/export function getUpdateObjURL\([\s\S]*?\n\}/)[0].replace('export ', '') +
    '\nreturn getUpdateObjURL'
)({ origin: 'http://localhost' })
const component = new Function(
  'AutoDataForm',
  'getUpdateObjURL',
  '_',
  parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
)({}, getUpdateObjURL, lodash)

function form(action, context = {}) {
  const values = { id: 'source-id', action, ...context }
  const vm = {
    ...component.data(),
    ...component.methods,
    url: '/api/v1/assets/databases/?platform=42',
    submitMethod: null,
    cloneNameSuffix: 'duplicate',
    $context: { get: (key) => values[key] },
    $emit() {},
    $log: { debug() {} },
    initial: {},
    needGetObjectDetail: null,
    action,
    actionId: values.id,
    drawer: Boolean(action)
  }
  vm.getUrl = component.props.getUrl.default.bind(vm)
  vm.setMethod()
  Object.defineProperty(vm, 'iUrl', { get: () => vm.getUrl() })
  return vm
}

test('asset clones use the same POST metadata endpoint as creation and retain source values', async () => {
  const vm = form('clone')
  const sourceAsset = {
    name: 'postgresql ssl require',
    address: '172.16.200.30',
    platform: { id: 42, name: 'PostgreSQL' },
    pg_ssl_mode: { value: 'require', label: 'Require' }
  }
  const requests = []
  vm.$axios = {
    get: async (url) => {
      requests.push(url)
      return lodash.cloneDeep(sourceAsset)
    }
  }
  const cloned = await vm.getFormValue()
  assert.deepEqual(requests, ['/api/v1/assets/databases/source-id/?platform=42'])
  assert.equal(cloned.name, 'postgresql ssl require-duplicate')
  assert.equal(cloned.address, sourceAsset.address)
  assert.deepEqual(cloned.platform, sourceAsset.platform)
  assert.deepEqual(cloned.pg_ssl_mode, sourceAsset.pg_ssl_mode)
  assert.equal(vm.method, 'post')
  const cloneUrl = new URL(vm.iUrl, 'http://localhost')
  const createUrl = new URL(form('create', { id: '' }).iUrl, 'http://localhost')
  assert.equal(cloneUrl.pathname, createUrl.pathname)
  assert.equal(cloneUrl.searchParams.get('platform'), '42')
  assert.equal(cloneUrl.searchParams.get('clone_from'), 'source-id')
  const submitted = []
  vm.$axios.post = async (url, values) => submitted.push({ url, values })
  await component.props.performSubmit.default.call(vm, cloned)
  assert.equal(submitted[0].url, vm.iUrl)
  assert.deepEqual(submitted[0].values, cloned)
})

test('update drawers and standalone update pages still use the detail endpoint', () => {
  for (const action of ['update', '']) {
    const vm = form(action)
    assert.equal(vm.method, 'put')
    const url = new URL(vm.iUrl, 'http://localhost')
    assert.equal(url.pathname, '/api/v1/assets/databases/source-id/')
    assert.equal(url.searchParams.get('platform'), '42')
    assert.equal(url.searchParams.has('clone_from'), false)
  }
})

test('creation inside an asset detail context does not inherit its update ID', () => {
  const vm = form('create')
  assert.equal(vm.method, 'post')
  assert.equal(vm.iUrl, '/api/v1/assets/databases/?platform=42')
})
