import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/AssignedTicketList.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const dependencies = {
  AutoDetailCard: {},
  Dialog: {},
  BaseTicketList: {},
  LoginAssetConnections: {},
  mapGetters: () => ({}),
  getTicketDetailRoute: (type) => (type === 'apply_asset' ? 'AssetsTicketDetail' : 'TicketDetail'),
  getErrorResponseMsg: (error) => error.response?.data?.detail || ''
}
const component = new Function(...Object.keys(dependencies), script)(...Object.values(dependencies))
const ticket = (id, tasks = [`task-${id}`]) => ({
  id,
  title: id,
  org_id: `org-${id}`,
  type: { value: 'apply_asset' },
  my_tasks: tasks
})
const conflict = { response: { status: 409, data: { detail: 'stale' } } }
function setup(tickets, post) {
  const messages = [],
    requests = [],
    routes = []
  let reloads = 0
  const vm = {
    $t: (key, values) => `${key}${values ? JSON.stringify(values) : ''}`,
    $axios: {
      post: (...args) => {
        requests.push(args)
        return post(...args)
      }
    },
    $message: { success: (message) => messages.push(message) },
    $refs: {
      BaseTicketList: {
        reloadTable: () => {
          reloads++
        }
      }
    },
    $router: {
      resolve: (route) => {
        routes.push(route)
        return { href: '/detail' }
      }
    }
  }
  Object.assign(vm, component.data.call(vm))
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  Object.defineProperty(vm, 'bulkSummary', { get: () => component.computed.bulkSummary.call(vm) })
  vm.extraTicketAction.extraMoreActions[0].callback({ selectedRows: tickets })
  return { vm, messages, requests, routes, reloads: () => reloads }
}

test('pending batches report progress and reject duplicate or opposite actions', async () => {
  const first = Promise.withResolvers(),
    second = Promise.withResolvers()
  const { vm, requests, messages, reloads } = setup([ticket('a'), ticket('b')], (url) =>
    url.includes('task-a') ? first.promise : second.promise
  )
  const submission = vm.bulk('approve')
  assert.equal(vm.bulkLoading, true)
  assert.equal(vm.bulkCompleted, 0)
  await vm.bulk('reject')
  assert.equal(requests.length, 2)
  first.resolve({})
  await new Promise(setImmediate)
  assert.equal(vm.bulkCompleted, 1)
  assert.equal(vm.isVisible, true)
  second.resolve({})
  await submission
  assert.equal(vm.bulkLoading, false)
  assert.equal(vm.isVisible, false)
  assert.equal(vm.bulkCompleted, 2)
  assert.equal(reloads(), 1)
  assert.deepEqual(messages, ['TicketBatchApproved{"count":2,"remaining":0}'])
  assert.ok(requests.every(([url]) => url.endsWith('/approve/')))
  assert.deepEqual(
    requests.map(([, , config]) => config.params.oid),
    ['org-a', 'org-b']
  )
  assert.ok(requests.every(([, , config]) => config.disableFlashErrorMsg))
})

test('mixed results stay open, put unfinished tickets first and never resend completed actions', async () => {
  const { vm, requests, messages, reloads, routes } = setup([ticket('a'), ticket('b')], (url) =>
    url.includes('task-b') ? Promise.reject(conflict) : Promise.resolve({})
  )
  await vm.bulk('reject')
  assert.equal(vm.isVisible, true)
  assert.equal(vm.bulkLoading, false)
  assert.equal(reloads(), 1)
  assert.deepEqual(messages, [])
  assert.deepEqual(
    vm.bulkResults.map((row) => [row.ticket.id, row.success]),
    [
      ['b', false],
      ['a', true]
    ]
  )
  assert.equal(vm.bulkResults[0].reason, 'TicketBatchStateChanged')
  assert.equal(vm.bulkSummary, 'TicketBatchRejectSummary{"count":1,"remaining":1}')
  await vm.bulk('approve')
  assert.equal(requests.length, 2)
  assert.equal(vm.ticketDetailUrl(vm.bulkResults[0].ticket), '/detail')
  assert.deepEqual(routes[0], {
    name: 'AssetsTicketDetail',
    params: { id: 'b' },
    query: { oid: 'org-b' }
  })
  vm.extraTicketAction.extraMoreActions[0].callback({ selectedRows: [ticket('c')] })
  assert.deepEqual(vm.bulkResults, [])
  assert.equal(vm.bulkCompleted, 0)
})

test('missing approval tasks and partially completed tasks cannot be reported as success', async () => {
  const { vm, requests, messages } = setup(
    [ticket('empty', []), ticket('partial', ['ok', 'stale'])],
    (url) => (url.includes('stale') ? Promise.reject(conflict) : Promise.resolve({}))
  )
  await vm.bulk('approve')
  assert.equal(requests.length, 2)
  assert.equal(vm.isVisible, true)
  assert.deepEqual(messages, [])
  assert.equal(vm.bulkResults[0].success, false)
  assert.equal(vm.bulkResults[0].reason, 'TicketBatchStateChanged')
  assert.equal(vm.bulkResults[1].partial, true)
  assert.equal(vm.bulkResults[1].success, false)
})

test('network and server failures retain an explicitly unconfirmed result', async () => {
  for (const error of [
    new Error('Network Error'),
    { response: { status: 503, data: '<html>proxy error</html>' } }
  ]) {
    const { vm } = setup([ticket('a')], () => Promise.reject(error))
    await vm.bulk('approve')
    assert.equal(vm.isVisible, true)
    assert.equal(vm.bulkResults[0].unknown, true)
    assert.equal(vm.bulkResults[0].reason, 'TicketBatchUnknownReason')
  }
})

test('permission, missing tasks and validation failures explain the next step', async () => {
  for (const [status, reason] of [
    [403, 'TicketBatchForbidden'],
    [404, 'TicketBatchUnavailable'],
    [400, 'Fill in the required resources']
  ]) {
    const { vm } = setup([ticket('a')], () =>
      Promise.reject({ response: { status, data: { detail: 'Fill in the required resources' } } })
    )
    await vm.bulk('approve')
    assert.equal(vm.bulkResults[0].reason, reason)
    assert.equal(vm.bulkResults[0].unknown, false)
  }
})

test('rejecting every ticket confirms the exact action; empty selections do nothing', async () => {
  const { vm, messages } = setup([ticket('a')], () => Promise.resolve({}))
  await vm.bulk('reject')
  assert.equal(vm.isVisible, false)
  assert.deepEqual(messages, ['TicketBatchRejected{"count":1,"remaining":0}'])
  const empty = setup([], () => assert.fail('empty batch must not submit'))
  await empty.vm.bulk('approve')
  assert.deepEqual(empty.messages, [])
  assert.equal(empty.reloads(), 0)
})
