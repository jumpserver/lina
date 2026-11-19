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
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)({}, {})

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


test('login workflow edit actions are available only for global definitions in the global organization', () => {
  const vm = { $t: key => key, $hasPerm: () => true, $store: { getters: { currentOrgIsRoot: false } } }
  const actions = component.data.call(vm).tableConfig.columnsMeta.actions.formatterArgs
  const row = { type: 'login_confirm', org_id: '00000000-0000-0000-0000-000000000000' }
  assert.equal(actions.hasUpdate({ row }), false)
  vm.$store.getters.currentOrgIsRoot = true
  assert.equal(actions.hasUpdate({ row }), true)
  assert.equal(actions.hasUpdate({ row: { ...row, org_id: 'historical-org' } }), false)
  vm.$store.getters.currentOrgIsRoot = false
  assert.equal(actions.hasUpdate({ row: { type: 'login_asset_confirm', org_id: 'org' } }), true)
})
