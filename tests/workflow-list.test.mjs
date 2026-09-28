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
})
