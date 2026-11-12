import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import mitt from 'mitt'

async function component(path, dependencies = {}) {
  const source = await readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
  const script = parse(source)
    .descriptor.script.content.replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default', 'return')
  return new Function(...Object.keys(dependencies), script)(...Object.values(dependencies))
}
const apiSource = (await readFile(new URL('../src/api/ticket.js', import.meta.url), 'utf8'))
  .replace(/^import .*$/gm, '')
  .replaceAll('export function', 'function')
function ticketApi(request) {
  return new Function(
    'request',
    `${apiSource}\nreturn { getPendingTicketsUrl, getTicketOpenCount }`
  )(request)
}
async function header(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const requests = []
  const bus = mitt()
  const focus = new Map()
  const panel = await component('layout/components/NavHeader/Tickets.vue', {
    getTicketOpenCount: (userId) =>
      new Promise((resolve, reject) => requests.push({ userId, resolve, reject })),
    mapGetters: () => ({}),
    eventBus: bus,
    window: {
      addEventListener: (name, fn) => focus.set(name, fn),
      removeEventListener: (name) => focus.delete(name)
    }
  })
  const vm = { ...panel.data(), currentUser: { id: 'reviewer' }, $router: { push() {} } }
  for (const [name, method] of Object.entries(panel.methods)) vm[name] = method.bind(vm)
  panel.created.call(vm)
  t.after(() => panel.beforeUnmount.call(vm))
  return { panel, vm, requests, bus, focus }
}

test('badge and pending list share one query, with a minimal unfiltered count request', async () => {
  let config
  const api = ticketApi((value) => {
    config = value
  })
  const list = await component('views/tickets/AssignedTicketList.vue', {
    AutoDetailCard: {},
    Dialog: {},
    BaseTicketList: {},
    LoginAssetConnections: {},
    mapGetters: () => ({}),
    getPendingTicketsUrl: api.getPendingTicketsUrl
  })
  api.getTicketOpenCount('reviewer')
  assert.equal(
    config.url,
    list.computed.url.call({ tab: 'pending', currentUser: { id: 'reviewer' } })
  )
  const query = Object.fromEntries(new URL(config.url, 'http://localhost').searchParams)
  assert.deepEqual(query, { assignees__id: 'reviewer', state: 'pending' })
  assert.deepEqual(config.params, { offset: 0, limit: 1 })
  assert.equal(config.disableFlashErrorMsg, true)
})

test('list loads and approval events refresh the global count without adopting filtered totals', async (t) => {
  const { vm, requests, bus, focus } = await header(t)
  requests[0].resolve({ count: 8 })
  await Promise.resolve()
  const list = await component('views/tickets/BaseTicketList.vue', {
    GenericListPage: {},
    DetailFormatter: {},
    TagChoicesFormatter: {},
    eventBus: bus
  })
  list.methods.onTableLoaded({ total: 1, query: { search: 'one ticket', type: 'apply_asset' } })
  requests[1].resolve({ count: 9 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 9)
  bus.emit('drawer-resource-change', { path: '/assets/hosts' })
  assert.equal(requests.length, 2)
  bus.emit('drawer-resource-change', { path: '/tickets/tickets/ticket-1' })
  requests[2].resolve({ count: 8 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 8)
  focus.get('focus')()
  requests[3].resolve({ count: 7 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 7)
  vm.goToTickets()
  assert.equal(requests.length, 5)
})

test('polling retries after failure, keeps the last count and can reach zero', async (t) => {
  const { vm, requests } = await header(t)
  requests[0].resolve({ count: 9 })
  await Promise.resolve()
  t.mock.timers.tick(29999)
  assert.equal(requests.length, 1)
  t.mock.timers.tick(1)
  requests[1].reject(new Error('offline'))
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 9)
  t.mock.timers.tick(30000)
  requests[2].resolve({ count: 0 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 0)
})

test('older responses cannot overwrite a refreshed count or start another timer', async (t) => {
  const { vm, requests, bus } = await header(t)
  bus.emit('ticket-count-refresh')
  requests[1].resolve({ count: 9 })
  await Promise.resolve()
  requests[0].resolve({ count: 8 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 9)
  t.mock.timers.tick(30000)
  assert.equal(requests.length, 3)
})

test('changing users clears the old count and ignores the old user response', async (t) => {
  const { panel, vm, requests } = await header(t)
  vm.assignedTicketCount = 8
  vm.currentUser = { id: 'other-reviewer' }
  panel.watch['currentUser.id'].call(vm)
  assert.equal(vm.assignedTicketCount, 0)
  assert.equal(requests[1].userId, 'other-reviewer')
  requests[0].resolve({ count: 8 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 0)
  requests[1].resolve({ count: 2 })
  await Promise.resolve()
  assert.equal(vm.assignedTicketCount, 2)
})

test('unmount removes listeners and prevents pending requests from changing count or polling', async (t) => {
  const { panel, vm, requests, bus, focus } = await header(t)
  panel.beforeUnmount.call(vm)
  requests[0].resolve({ count: 9 })
  await Promise.resolve()
  bus.emit('ticket-count-refresh')
  bus.emit('drawer-resource-change', { path: '/tickets/tickets/1' })
  t.mock.timers.tick(60000)
  assert.equal(vm.assignedTicketCount, 0)
  assert.equal(requests.length, 1)
  assert.equal(focus.size, 0)
  assert.equal(bus.all.get('ticket-count-refresh').length, 0)
})
