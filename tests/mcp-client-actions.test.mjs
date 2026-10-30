import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(
  new URL('../src/components/Apps/MCPClientActions/index.js', import.meta.url),
  'utf8'
)
const { getMCPClientActions } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
)

function clientManager() {
  const calls = []
  return {
    calls,
    submitting: false,
    permitted: true,
    $t: (key) => key,
    $hasPerm(perm) {
      return this.permitted && perm === 'settings.change_auth'
    },
    setClientActive(row, active) {
      calls.push({ id: row.id, active })
    },
    deleteClient(row) {
      calls.push({ id: row.id, deleted: true })
    }
  }
}

test('user-detail actions target the registration ID rather than the OAuth application ID', () => {
  const vm = clientManager()
  const row = { id: 101, registration_id: 7, name: 'Managed client', is_active: false }
  const actions = getMCPClientActions(vm, 'registration_id')
  assert.deepEqual(
    actions.filter((action) => action.has({ row })).map((action) => action.name),
    ['enable', 'delete']
  )
  actions.find((action) => action.name === 'enable').callback({ row })
  actions.find((action) => action.name === 'disable').callback({ row })
  actions.find((action) => action.name === 'delete').callback({ row })
  assert.deepEqual(vm.calls, [
    { id: 7, active: true },
    { id: 7, active: false },
    { id: 7, deleted: true }
  ])
  assert.equal(row.id, 101)
})

test('expired user authorization does not make an enabled registration look disabled', () => {
  const actions = getMCPClientActions(clientManager(), 'registration_id')
  const row = { id: 101, registration_id: 7, is_active: true, status: 'expired' }
  assert.deepEqual(
    actions.filter((action) => action.has({ row })).map((action) => action.name),
    ['disable', 'delete']
  )
  for (const missingMetadata of [
    { id: 101, status: 'disabled' },
    { id: 101, is_active: false }
  ]) {
    assert.deepEqual(
      actions.filter((action) => action.has({ row: missingMetadata })),
      []
    )
  }
})

test('settings actions retain registration IDs and require permission while not submitting', () => {
  const vm = clientManager()
  const actions = getMCPClientActions(vm)
  const row = { id: 7, is_active: true }
  actions.find((action) => action.name === 'disable').callback({ row })
  assert.deepEqual(vm.calls, [{ id: 7, active: false }])
  assert.ok(actions.every((action) => action.can()))
  vm.submitting = true
  assert.ok(actions.every((action) => !action.can()))
  vm.submitting = false
  vm.permitted = false
  assert.ok(actions.every((action) => !action.can()))
})
