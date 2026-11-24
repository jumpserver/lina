import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { compileFunction } from 'node:vm'
import { parse } from '@vue/compiler-sfc'

const path = new URL('../src/views/tickets/TicketFlow/FlowCreateUpdate.vue', import.meta.url)
const { descriptor } = parse(await readFile(path, 'utf8'))
const component = compileFunction(
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return'),
  ['GenericCreateUpdatePage', 'ResourceSelect', 'FlowRuleField']
)({}, {}, {})

test('opening a ticket flow form keeps its default organization out of the list route', () => {
  const routeQuery = { order: '-date_created' }
  const form = {
    $context: { getScope: () => ({}) },
    $route: { query: routeQuery },
    $store: { getters: { consoleOrgs: [{ id: 'org-A' }] } }
  }
  form.initial = component.computed.initial.call(form)
  component.mounted.call(form)

  assert.deepEqual(routeQuery, { order: '-date_created' })
  assert.deepEqual(form.initial, { order: '-date_created', org_id: 'org-A' })
})
