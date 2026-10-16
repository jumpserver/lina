import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { computed, effectScope, nextTick, reactive, watch } from 'vue'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketReplayAccess.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
// eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
const component = new Function('IBox', 'useDateTime', script)({}, () => ({}))

function mountState(t, object) {
  const scope = effectScope()
  let vm
  scope.run(() => {
    vm = reactive({ ...component.data(), object })
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
  const expiresAt = new Date(expires).toISOString()
  return {
    id: 'ticket-a',
    org_id: 'org-a',
    state: { value: 'approved' },
    replay_access_status: { state: 'available', expires_at: expiresAt },
    available_actions: [{ type: 'download_replay', session_id: 'session-a', expires_at: expiresAt }]
  }
}

test('replay downloads require approval and an explicit unexpired server action', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, approvedTicket())
  assert.equal(vm.accessState, 'available')
  assert.equal(vm.downloadUrl, '/api/v1/tickets/tickets/ticket-a/replay/download/?oid=org-a')
  for (const [state, key] of Object.entries({
    expired: 'Expired',
    pending: 'Pending',
    unapproved: 'Unapproved',
    not_applicant: 'ApplicantOnly',
    unavailable: 'Unavailable'
  })) {
    vm.object.replay_access_status.state = state
    assert.equal(vm.statusMessage, `TicketReplay${key}`)
    assert.equal(vm.downloadUrl, '')
  }
  vm.object.replay_access_status.state = 'available'
  vm.object.state = 'pending'
  assert.equal(vm.accessState, 'pending')
  assert.equal(vm.downloadUrl, '')
  vm.object.state = 'rejected'
  assert.equal(vm.accessState, 'unapproved')
  vm.object.state = 'approved'
  vm.object.available_actions[0].expires_at = 'invalid'
  assert.equal(vm.downloadUrl, '')
  vm.object.available_actions[0].expires_at = new Date(500).toISOString()
  assert.equal(vm.accessState, 'expired')
  vm.object.available_actions = [{ type: 'view_secret', expires_at: new Date(3000).toISOString() }]
  assert.equal(vm.downloadUrl, '')
  delete vm.object.replay_access_status
  delete vm.object.available_actions
  assert.equal(
    vm.accessState,
    'unavailable',
    'approval alone must not grant download access without a server action'
  )
  assert.equal(vm.downloadUrl, '')
  await nextTick()
})

test('download links and expiry timers follow the current ticket and organization', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, approvedTicket(2000))
  t.mock.timers.tick(500)
  vm.object = { ...approvedTicket(4000), id: 'ticket-b', org_id: 'org & b' }
  await nextTick()
  assert.equal(
    vm.downloadUrl,
    '/api/v1/tickets/tickets/ticket-b/replay/download/?oid=org%20%26%20b'
  )
  t.mock.timers.tick(500)
  await nextTick()
  assert.equal(vm.now, 1500, 'the previous ticket timer must have been cleared')
  assert.equal(vm.accessState, 'available')
  t.mock.timers.tick(2000)
  await nextTick()
  assert.equal(vm.accessState, 'expired')
  assert.equal(vm.downloadUrl, '')
  assert.equal(vm.expiryTimer, null)

  vm.object = approvedTicket(6000)
  await nextTick()
  component.beforeUnmount.call(vm)
  t.mock.timers.tick(3000)
  assert.equal(vm.now, 4000, 'unmounting must cancel the outstanding timer')
})

test('a delayed expiry timer cannot allow a download click after the deadline', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, approvedTicket(2000))
  let prevented = false
  const event = { preventDefault: () => (prevented = true) }
  vm.checkDownload(event)
  assert.equal(prevented, false)
  t.mock.timers.setTime(2500)
  vm.checkDownload(event)
  assert.equal(prevented, true)
  assert.equal(vm.downloadUrl, '')
})
