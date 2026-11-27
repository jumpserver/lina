import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/Workflow/List.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(
  'GenericListPage',
  'DetailFormatter',
  'getErrorResponseMsg',
  'WorkflowReferences',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)({}, {}, error => error.response.data.detail, {})

test('workflow edit opens the selected designer instead of the default update drawer', () => {
  const routes = []
  const { tableConfig } = component.data.call({
    $t: (key) => key,
    $hasPerm: () => true,
    $router: { push: (route) => routes.push(route) }
  })
  for (const row of [
    { id: 'draft-flow', active_version: null },
    { id: 'published-flow', active_version: 'version-2' }
  ]) {
    tableConfig.columnsMeta.actions.formatterArgs.onUpdate({ row })
    assert.deepEqual(routes.at(-1), {
      name: 'WorkflowDetail',
      params: { id: row.id }
    })
    assert.deepEqual(routes.at(-1), tableConfig.columnsMeta.name.formatterArgs.getRoute({ row }))
  }
  const title = tableConfig.columnsMeta.name.formatterArgs.getTitle
  assert.equal(title({ row: { name: 'Apply for asset', display_name: '申请资产' } }), '申请资产')
  assert.equal(title({ row: { name: 'Custom approval' } }), 'Custom approval')
})

test('delete requires workflow delete permission and access to the owning organization', () => {
  const vm = {
    $t: key => key,
    $hasPerm: perm => perm === 'tickets.delete_workflow',
    $store: { getters: { currentOrgIsRoot: false, currentOrg: { id: 'org' } } }
  }
  const { canDelete } = component.data.call(vm).tableConfig.columnsMeta.actions.formatterArgs
  assert.equal(canDelete({ row: { org_id: 'other' } }), false)
  assert.equal(canDelete({ row: { org_id: 'org' } }), true)
  vm.$store.getters.currentOrgIsRoot = true
  assert.equal(canDelete({ row: { org_id: 'other' } }), true)
  vm.$hasPerm = () => false
  assert.equal(canDelete({ row: { org_id: 'org' } }), false)
})

test('workflow delete handles cancellation, linked records, and successful removal', async () => {
  const calls = []
  const vm = {
    $t: key => key,
    $confirm: async () => { throw new Error('cancel') },
    $axios: { delete: async () => { throw { response: { data: { detail: 'Clear the linked ACL first' } } } } },
    $alert: async message => calls.push(message),
    $message: { success: message => calls.push(message) }
  }
  const remove = () => component.methods.deleteWorkflow.call(vm, {
    row: { id: 'flow', name: 'Review' }, reload: () => calls.push('reload')
  })
  await remove()
  assert.deepEqual(calls, [])
  vm.$confirm = async () => {}
  await remove()
  assert.deepEqual(calls, ['Clear the linked ACL first'])
  vm.$axios.delete = async () => { throw { response: { data: { code: 'referenced_by_others', detail: 'Linked rule' } } } }
  await remove()
  assert.deepEqual(vm.references, { workflow: { id: 'flow', name: 'Review' }, reason: 'Linked rule' })
  assert.deepEqual(calls, ['Clear the linked ACL first'])
  calls.length = 0
  vm.$axios.delete = async url => calls.push(url)
  await remove()
  assert.deepEqual(calls, ['/api/v1/tickets/workflows/flow/', 'reload', 'DeleteSuccessMsg'])
})


test('workflow edit actions respect permissions and organization restrictions', () => {
  const globalId = '00000000-0000-0000-0000-000000000000'
  const getters = { currentOrgIsRoot: true, currentOrg: { id: globalId } }
  const vm = { $t: key => key, $hasPerm: perm => perm === 'tickets.change_workflow', $store: { getters } }
  const actions = component.data.call(vm).tableConfig.columnsMeta.actions.formatterArgs
  const globalLogin = { row: { type: 'login_confirm', org_id: globalId } }
  const localLogin = { row: { type: 'login_confirm', org_id: 'org' } }
  const assetLogin = { row: { type: 'login_asset_confirm', org_id: 'org' } }

  assert.equal(actions.canUpdate(globalLogin), true)
  assert.equal(actions.canUpdate(localLogin), false)
  assert.equal(actions.canUpdate(assetLogin), false)
  vm.$hasPerm = () => false
  assert.equal(actions.canUpdate(globalLogin), false)

  getters.currentOrgIsRoot = false
  getters.currentOrg = { id: 'org' }
  vm.$hasPerm = () => true
  assert.equal(actions.canUpdate(globalLogin), false)
  assert.equal(actions.canUpdate(localLogin), false)
  assert.equal(actions.canUpdate(assetLogin), true)
})
