import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { computed, effectScope, nextTick, reactive, watch } from 'vue'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketSecretAccess.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
// eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
const component = new Function('IBox', 'Dialog', 'copy', 'useDateTime', script)(
  {},
  {},
  () => {},
  () => ({})
)

function mountState(t, object, post = () => assert.fail('Unexpected password request')) {
  const scope = effectScope()
  let vm
  scope.run(() => {
    vm = reactive({ ...component.data(), object, $axios: { post } })
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

function approvedTicket(expiresAt) {
  return {
    id: 'ticket-a',
    org_id: 'org-a',
    state: { value: 'approved' },
    secret_access_status: { state: 'available', expires_at: expiresAt },
    available_actions: [
      { type: 'view_secret', account_id: 'account-a', name: 'root', expires_at: expiresAt }
    ]
  }
}

test('password access maps server states and never assumes approval is sufficient', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const vm = mountState(t, approvedTicket(new Date(3000).toISOString()))
  vm.object.available_actions.push({ type: 'download', account_id: 'other' })
  assert.equal(vm.actions.length, 1)
  assert.equal(vm.activeActions.length, 1)
  assert.equal(vm.accessState, 'available')
  for (const [state, message] of Object.entries({
    expired: 'TicketSecretExpired',
    pending: 'TicketSecretPending',
    unapproved: 'TicketSecretUnapproved',
    not_applicant: 'TicketSecretApplicantOnly',
    disabled: 'TicketSecretDisabled',
    unavailable: 'TicketSecretUnavailable'
  })) {
    vm.object.secret_access_status.state = state
    assert.equal(vm.accessState, state)
    assert.equal(vm.statusMessage, message)
    await vm.reveal(vm.actions[0])
  }
  delete vm.object.secret_access_status
  assert.equal(
    vm.accessState,
    'available',
    'older backends still provide explicit authorized actions'
  )
  vm.object.available_actions[0].expires_at = new Date(500).toISOString()
  assert.equal(vm.accessState, 'expired')
  vm.object.available_actions = []
  vm.object.state = { value: 'pending' }
  assert.equal(vm.accessState, 'pending')
  vm.object.state = { value: 'rejected' }
  assert.equal(vm.accessState, 'unapproved')
  vm.object.state = { value: 'approved' }
  assert.equal(vm.accessState, 'unavailable')
  vm.object.secret_access_status = { state: 'expired', expires_at: new Date(500).toISOString() }
  assert.equal(vm.expiresAt, new Date(500).toISOString())
})

test('each open password expires even while another account remains available', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const calls = []
  const vm = mountState(t, approvedTicket(new Date(2000).toISOString()), async (...args) => {
    calls.push(args)
    return { name: 'root', secret: 'fake-secret' }
  })
  vm.object.available_actions.push({
    type: 'view_secret',
    account_id: 'account-b',
    name: 'operator',
    expires_at: new Date(4000).toISOString()
  })
  await nextTick()
  await vm.reveal(vm.actions[0])
  assert.equal(vm.visible, true)
  assert.equal(vm.secret, 'fake-secret')
  assert.deepEqual(calls[0], [
    '/api/v1/accounts/accounts/account-a/reveal-by-ticket/',
    { ticket_id: 'ticket-a' },
    { params: { oid: 'org-a' } }
  ])
  t.mock.timers.tick(999)
  await nextTick()
  assert.equal(vm.accessState, 'available')
  t.mock.timers.tick(101)
  await nextTick()
  assert.equal(vm.accessState, 'available')
  assert.equal(vm.activeActions.length, 1)
  assert.equal(vm.visible, false)
  assert.equal(vm.secret, '')
  await vm.reveal(vm.actions[0])
  assert.equal(calls.length, 1)
  t.mock.timers.tick(2000)
  await nextTick()
  assert.equal(vm.accessState, 'expired')
  assert.equal(vm.activeActions.length, 0)
  assert.equal(vm.expiresAt, new Date(4000).toISOString())
})

test('late password responses are discarded after changing tickets or reaching expiry', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  const requests = []
  const vm = mountState(
    t,
    approvedTicket(new Date(3000).toISOString()),
    (...args) => new Promise((resolve) => requests.push({ args, resolve }))
  )
  const outdated = vm.reveal(vm.actions[0])
  vm.object = { ...approvedTicket(new Date(3000).toISOString()), id: 'ticket-b', org_id: 'org-b' }
  await nextTick()
  requests[0].resolve({ name: 'old account', secret: 'fake-old-secret' })
  await outdated
  assert.equal(vm.visible, false)
  assert.equal(vm.secret, '')
  assert.equal(vm.loadingId, '')

  const expiresDuringRequest = vm.reveal(vm.actions[0])
  assert.deepEqual(requests[1].args[1], { ticket_id: 'ticket-b' })
  assert.deepEqual(requests[1].args[2], { params: { oid: 'org-b' } })
  t.mock.timers.tick(2100)
  await nextTick()
  requests[1].resolve({ name: 'root', secret: 'fake-expired-secret' })
  await expiresDuringRequest
  assert.equal(vm.accessState, 'expired')
  assert.equal(vm.visible, false)
  assert.equal(vm.secret, '')
  assert.equal(vm.loadingId, '')
})

test('closing the password dialog clears its data and reopening fetches a fresh secret', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  let requests = 0
  const vm = mountState(t, approvedTicket(new Date(3000).toISOString()), async () => ({
    name: 'root',
    secret: `fake-secret-${++requests}`
  }))
  await vm.reveal(vm.actions[0])
  assert.equal(vm.secret, 'fake-secret-1')
  assert.equal(vm.visible, true)
  vm.secretVisible = true

  vm.visible = false
  vm.clear()
  assert.equal(vm.secret, '')
  assert.equal(vm.accountName, '')
  assert.equal(vm.revealedAccountId, '')
  assert.equal(vm.loadingId, '')
  assert.equal(vm.secretVisible, false)

  await vm.reveal(vm.actions[0])
  assert.equal(requests, 2, 'reopening must not reuse a previously revealed password')
  assert.equal(vm.secret, 'fake-secret-2')
  assert.equal(vm.secretVisible, false)
  assert.equal(vm.accountName, 'root')
  assert.equal(vm.revealedAccountId, 'account-a')
  assert.equal(vm.visible, true)
})
