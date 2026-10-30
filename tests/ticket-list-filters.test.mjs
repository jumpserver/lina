import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import isEqual from 'lodash/isEqual.js'

async function loadComponent(file, dependencies) {
  const source = await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  const script = descriptor.script.content
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default', 'return')
  return new Function(...Object.keys(dependencies), script)(...Object.values(dependencies))
}
const base = await loadComponent('views/tickets/BaseTicketList.vue', {
  GenericListPage: {},
  DetailFormatter: {},
  TagChoicesFormatter: {},
  APPROVE: 'approved',
  CLOSED: 'closed',
  OPEN: 'pending',
  REJECT: 'rejected',
  TICKET_TYPE_I18N_KEYS: { apply_asset: 'ApplyAsset', file_transfer: 'TicketFileTransfer' },
  getTicketTypeLabel: (type) => type.label || type.value,
  getTicketStateLabel: (state) => state.label
})
const myTickets = await loadComponent('views/tickets/MyTicketList.vue', {
  mapGetters: () => ({}),
  BaseTicketList: {},
  TicketTypeDrawer: {}
})
const quickFilter = await loadComponent('components/Table/ListTable/TableAction/QuickFilter.vue', {
  SummaryCard: {},
  isEqual
})
function categories(pendingOnly = false) {
  return base.computed.quickFilters.call({
    pendingOnly,
    $t: (key) => key,
    ticketTypes: [{ label: 'File transfer', filter: { type: 'file_transfer' } }]
  })
}
function quickFilterVm(filters = categories()) {
  const events = []
  const vm = {
    ...quickFilter.data(),
    filters,
    summary: null,
    $emit: (...args) => events.push(args)
  }
  for (const [name, method] of Object.entries(quickFilter.methods)) vm[name] = method.bind(vm)
  vm.generateCount = () => {}
  quickFilter.mounted.call(vm)
  return { vm, events }
}

test('my tickets defaults to every approval state while preserving ownership and origin', () => {
  for (const tab of ['manual', 'system', 'beneficiary', 'all']) {
    const url = myTickets.computed.url.call({ tab, currentUser: { id: 'user-1' } })
    const params = new URL(url, 'http://localhost').searchParams
    assert.equal(params.has('status'), false)
    assert.equal(params.has('state'), false)
    assert.equal(params.get(tab === 'beneficiary' ? 'beneficiary' : 'applicant'), 'user-1')
    assert.equal(params.get('origin'), ['manual', 'system'].includes(tab) ? tab : null)
  }
})

test('completed approvals and a specific approval result never combine conflicting statuses', () => {
  const { vm } = quickFilterVm()
  const [types, states] = vm.iFilters
  vm.handleFilterClick(types.options[1])
  vm.handleFilterClick(states.options.find((option) => option.label === 'TicketApprovalFinished'))
  assert.deepEqual(vm.filtered, { type: 'file_transfer', state: 'all', status: 'closed' })
  for (const state of ['pending', 'approved', 'rejected', 'closed', 'expired', 'error']) {
    vm.handleFilterClick(states.options.find((option) => option.filter.state === state))
    assert.deepEqual(vm.filtered, { type: 'file_transfer', state, status: '' })
  }
  vm.handleFilterClick(states.options[0])
  vm.handleFilterClick(types.options[0])
  assert.deepEqual(vm.filtered, { type: '', state: 'all', status: '' })
})

test('async type updates keep the selected type and approval result', () => {
  const { vm } = quickFilterVm()
  vm.handleFilterClick(vm.iFilters[0].options[1])
  vm.handleFilterClick(vm.iFilters[1].options.find((option) => option.filter.state === 'approved'))
  vm.filters[0].options.push({ label: 'New plugin', filter: { type: 'new_plugin' } })
  quickFilter.watch.filters.handler.call(vm)
  assert.ok(vm.iFilters[0].options.some((option) => option.filter.type === 'new_plugin'))
  assert.deepEqual(vm.filtered, { type: 'file_transfer', state: 'approved', status: '' })
  assert.equal(vm.iFilters[0].options[1].active, true)
})

test('pending approvals remove conflicting result filters while retaining the selected type', () => {
  const { vm, events } = quickFilterVm()
  vm.handleFilterClick(vm.iFilters[0].options[1])
  vm.handleFilterClick(vm.iFilters[1].options.find((option) => option.filter.state === 'rejected'))
  vm.filters = categories(true)
  quickFilter.watch.filters.handler.call(vm)
  assert.equal(vm.iFilters.length, 1)
  assert.deepEqual(events.at(-1), ['filter', { type: 'file_transfer' }])
  vm.filters = categories(false)
  quickFilter.watch.filters.handler.call(vm)
  assert.deepEqual(vm.filtered, { type: 'file_transfer', state: 'all', status: '' })
  assert.equal(vm.iFilters[1].options[0].active, true)
})

test('removing a selected option removes its hidden query but keeps independent summary filters', () => {
  const { vm } = quickFilterVm()
  vm.handleFilterClick(vm.iFilters[0].options[1])
  vm.handleFilterClick({ category: 'summary', active: false, filter: { risk: 'high' } })
  vm.filters[0].options.pop()
  quickFilter.watch.filters.handler.call(vm)
  assert.equal(vm.filtered.type, undefined)
  assert.equal(vm.filtered.risk, 'high')
})

test('type choices load from the plugin registry and retain fallback choices on errors', async () => {
  const vm = {
    ticketTypes: [],
    $t: (key) => key,
    $axios: {
      get: async () => [
        { type: 'file_transfer', label: 'File transfer' },
        { type: 'new_plugin', label: 'New plugin' }
      ]
    }
  }
  await base.methods.loadTypes.call(vm)
  assert.deepEqual(
    vm.ticketTypes.map((type) => type.filter.type),
    ['file_transfer', 'new_plugin']
  )
  const previous = vm.ticketTypes
  vm.$axios.get = async () => {
    throw new Error('Unavailable')
  }
  await base.methods.loadTypes.call(vm)
  assert.equal(vm.ticketTypes, previous)
})
