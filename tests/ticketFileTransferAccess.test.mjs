import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { computed, effectScope, h, nextTick, reactive, watch } from 'vue'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketFileTransferAccess.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
// eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
const component = new Function('h', 'Details', 'useDateTime', script)(h, {}, () => ({}))

function mountState(t, object) {
  const scope = effectScope()
  let vm
  scope.run(() => {
    vm = reactive({
      ...component.data(),
      object,
      requestItems: [],
      $t: (key) => key,
      toSafeLocalDateStr: (value) => (value ? `local:${value}` : '-')
    })
    for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
    for (const [name, getter] of Object.entries(component.computed)) {
      const value = computed(() => getter.call(vm))
      Object.defineProperty(vm, name, { get: () => value.value })
    }
    for (const [name, definition] of Object.entries(component.watch)) {
      const { handler = definition, ...options } = definition
      watch(() => vm[name], handler.bind(vm), options)
    }
  })
  t.after(() => {
    component.beforeUnmount.call(vm)
    scope.stop()
  })
  return vm
}

function approvedTicket(expires = 3000) {
  return {
    id: 'one',
    org_id: 'org-one',
    execution_mode: 'automatic',
    state: { value: 'approved' },
    result: {
      state: 'available',
      direction: 'upload',
      accounts: ['root'],
      protocols: ['ssh'],
      starts_at: new Date(500).toISOString(),
      expires_at: new Date(expires).toISOString()
    }
  }
}

test('transfer status requires a current server grant and preserves legacy approval-only tickets', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, approvedTicket())
  assert.equal(vm.accessState, 'available')
  assert.equal(vm.direction, 'upload')
  for (const state of ['pending', 'expired', 'unavailable']) {
    vm.object.state = state === 'pending' ? 'pending' : 'approved'
    vm.object.result.state = state
    assert.equal(vm.accessState, state)
  }
  vm.object.result.state = 'available'
  vm.object.state = 'rejected'
  assert.equal(vm.accessState, 'unavailable')
  vm.object.state = 'approved'
  vm.object.execution_mode = 'approval_only'
  assert.equal(vm.accessState, 'approval_only')
  vm.object.execution_mode = 'automatic'
  vm.object.result.expires_at = 'invalid'
  assert.equal(vm.accessState, 'unavailable')
  vm.object.result = {}
  assert.equal(vm.accessState, 'unavailable')
})

test('approval refresh, expiry and switching organizations do not retain stale authorization state', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, { ...approvedTicket(), state: 'pending' })
  assert.equal(vm.accessState, 'pending')
  vm.object = approvedTicket(2000)
  await nextTick()
  assert.equal(vm.accessState, 'available')
  t.mock.timers.tick(500)
  vm.object = { ...approvedTicket(4000), id: 'two', org_id: 'org-two' }
  await nextTick()
  t.mock.timers.tick(500)
  await nextTick()
  assert.equal(vm.now, 1500)
  assert.equal(vm.accessState, 'available')
  t.mock.timers.tick(2000)
  await nextTick()
  assert.equal(vm.accessState, 'expired')
  assert.equal(vm.expiryTimer, null)
  vm.object = approvedTicket(6000)
  await nextTick()
  component.beforeUnmount.call(vm)
  t.mock.timers.tick(3000)
  assert.equal(vm.now, 4000)
})

test('request details hide authorization dates until approved and preserve expired grant dates', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, approvedTicket())
  vm.requestItems = [
    { key: 'Asset', value: 'centos-ssh' },
    { key: 'Accounts', value: ['root'] },
    { key: 'TicketTransferDirection', value: 'Upload' },
    { key: 'TicketTransferPaths', value: ['/tmp/test'] }
  ]
  const rows = () => vm.detailItems.map(({ key, value }) => ({ key, value }))
  assert.deepEqual(rows(), [
    ...vm.requestItems,
    { key: 'TicketTransferStatus', value: 'TicketTransferAvailable' },
    { key: 'Protocols', value: 'ssh' },
    { key: 'TicketTransferStartsAt', value: 'local:' + vm.access.starts_at },
    { key: 'TicketTransferExpiresAt', value: 'local:' + vm.access.expires_at }
  ])
  const status = vm.detailItems[4]
  assert.equal(status.formatter({}, status.value).props.role, 'status')
  t.mock.timers.tick(2000)
  await nextTick()
  assert.equal(rows()[4].value, 'TicketTransferExpired')
  assert.equal(rows()[7].value, 'local:' + vm.access.expires_at)

  vm.object = {
    id: 'pending',
    org_id: 'org-two',
    state: 'pending',
    result: { state: 'pending', protocols: ['sftp', 'ssh'] }
  }
  await nextTick()
  assert.deepEqual(rows().slice(4), [
    { key: 'TicketTransferStatus', value: 'TicketTransferPending' },
    { key: 'Protocols', value: 'sftp, ssh' }
  ])
  for (const state of ['pending', 'rejected', 'closed']) {
    vm.object = { ...approvedTicket(), state: { value: state } }
    assert.equal(rows().length, 6, `${state} tickets must not show authorization dates`)
  }
  vm.object = { ...approvedTicket(), result: { state: 'unavailable' } }
  assert.equal(
    rows().length,
    6,
    'approval without actual authorization dates has no empty date fields'
  )
  vm.object.result = { state: 'approval_only' }
  assert.deepEqual(rows(), [
    ...vm.requestItems,
    { key: 'TicketTransferStatus', value: 'TicketTransferLegacy' }
  ])
})
