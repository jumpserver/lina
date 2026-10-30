import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import _ from 'lodash'

test('remote queries reject stale organization/search results and errors without losing pagination', async () => {
  const source = await readFile(
    new URL('../src/components/Form/FormFields/Select2.vue', import.meta.url),
    'utf8'
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const cacheRequests = []
  // eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
  const component = new Function('createSourceIdCache', 'i18n', '_', script)(
    (values) => new Promise((resolve) => cacheRequests.push({ values, resolve })),
    { global: { t: (key) => key } },
    _
  )
  const requests = []
  const vm = {
    options: [],
    ajax: {},
    url: '/sessions/?oid=old-org',
    defaultPageSize: 10,
    multiple: false,
    disabled: false,
    valueKey: 'id',
    $log: { debug() {} },
    $emit() {},
    $axios: {
      get(url, config) {
        return new Promise((resolve, reject) => requests.push({ url, config, resolve, reject }))
      }
    }
  }
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(vm, name, {
      get: (typeof getter === 'function' ? getter : getter.get).bind(vm)
    })
  }
  Object.assign(vm, component.data.call(vm))

  const initial = vm.initialSelect()
  const oldOrg = requests.at(-1)
  vm.url = '/sessions/?oid=new-org'
  const refreshed = vm.refresh()
  oldOrg.config.validateStatus(403)
  requests.at(-1).resolve({ results: [], next: null })
  await refreshed
  oldOrg.resolve({ results: [{ id: 'old-org-session', name: 'Old session' }], next: null })
  await initial
  await new Promise((resolve) => setTimeout(resolve, 210))
  assert.deepEqual(vm.iOptions, [])
  assert.equal(vm.selectDisabled, false)
  assert.equal(vm.remote, true, 'empty remote results must still allow a new server search')

  const obsoleteSearch = vm.filterOptions('old query')
  const oldSearch = requests.at(-1)
  const currentSearch = vm.filterOptions('current query')
  requests.at(-1).resolve({ results: [{ id: 'first', name: 'First' }], next: '/next/' })
  await currentSearch
  oldSearch.reject(new Error('Obsolete search failed'))
  await obsoleteSearch
  assert.deepEqual(vm.optionsValues, ['first'])
  assert.equal(vm.requestError, false)

  const obsoleteMore = vm.loadMore()
  const oldPage = requests.at(-1)
  const newSearch = vm.filterOptions('new query')
  requests.at(-1).resolve({ results: [{ id: 'new-first', name: 'New first' }], next: '/next/' })
  await newSearch
  const currentMore = vm.loadMore()
  const newPage = requests.at(-1)
  assert.equal(newPage.config.params.offset, 10)
  oldPage.reject(new Error('Obsolete page failed'))
  await obsoleteMore
  assert.equal(vm.loading, true)
  assert.equal(vm.params.page, 2)
  assert.equal(vm.requestError, false)
  newPage.resolve({ results: [{ id: 'new-second', name: 'New second' }], next: null })
  await currentMore
  assert.deepEqual(vm.optionsValues, ['new-first', 'new-second'])
  assert.equal(vm.loading, false)

  vm.resetParams()
  vm.iOptions = []
  const firstPage = vm.getOptions()
  const pageOne = requests.at(-1)
  vm.params.page = 2
  const secondPage = vm.getOptions()
  requests.at(-1).resolve({ results: [{ id: 'page-two', name: 'Page two' }], next: null })
  await secondPage
  pageOne.resolve({ results: [{ id: 'page-one', name: 'Page one' }], next: '/next/' })
  await firstPage
  assert.deepEqual(vm.optionsValues, ['page-two', 'page-one'])
  assert.equal(vm.params.hasMore, false)

  vm.modelValue = 'old-selection'
  const oldSelection = vm.syncExternalValue('old-selection')
  const oldCache = cacheRequests.at(-1)
  assert.equal(vm.transformed, true)
  vm.url = '/sessions/?oid=selection-org'
  vm.modelValue = 'new-selection'
  const changedOrg = vm.refresh()
  requests.at(-1).resolve({ results: [], next: null })
  await changedOrg
  const newSelection = vm.syncExternalValue('new-selection')
  cacheRequests.at(-1).resolve({ spm: 'new-selection-cache' })
  await Promise.resolve()
  assert.equal(requests.at(-1).config.params.spm, 'new-selection-cache')
  requests
    .at(-1)
    .resolve({ results: [{ id: 'new-selection', name: 'Selected session' }], next: null })
  await newSelection
  assert.equal(vm.innerValue, 'new-selection')
  assert.equal(vm.transformed, false, 'completed hydration must reveal the selected label')
  assert.deepEqual(vm.iOptions, [{ value: 'new-selection', label: 'Selected session' }])
  const requestCount = requests.length
  oldCache.resolve({ spm: 'old-selection-cache' })
  await oldSelection
  assert.equal(requests.length, requestCount, 'an old cache response must not start a new lookup')
  assert.equal(vm.params.spm, undefined)
  assert.equal(vm.innerValue, 'new-selection')
  assert.equal(vm.transformed, false)
})
