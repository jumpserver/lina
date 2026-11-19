import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/settings/Terminal/Component/TerminalList.vue', import.meta.url),
  'utf8'
)
let savedColumns
let writes
class ObjectLocalStorage {
  constructor(key, attr) {
    assert.equal(key, 'tableColumns')
    assert.equal(attr, 'TerminalSetting_/api/v1/terminal/terminals/')
  }
  get() {
    return savedColumns
  }
  set(value) {
    savedColumns = value
    writes++
  }
}
const component = new Function(
  'Select2',
  'ListTable',
  'GenericUpdateFormDialog',
  'DetailFormatter',
  'ObjectLocalStorage',
  parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
)({}, {}, {}, {}, ObjectLocalStorage)
const config = component.data.call({ $t: (key) => key, $tc: (key) => key }).tableConfig

test('status columns keep zero and percentages, and distinguish missing metrics', () => {
  const columns = ['cpu_load', 'memory_used', 'disk_used']
  const format = (stat) => columns.map((key) => config.columnsMeta[key].formatter({ stat }))
  assert.deepEqual(format({ cpu_load: 0.9, memory_used: 83.7, disk_used: 94.4 }), [
    0.9,
    '83.7%',
    '94.4%'
  ])
  assert.deepEqual(format({ cpu_load: 0, memory_used: 0, disk_used: 0 }), [0, '0%', '0%'])
  for (const stat of [
    undefined,
    null,
    {},
    { cpu_load: null, memory_used: null, disk_used: null }
  ]) {
    assert.deepEqual(format(stat), ['—', '—', '—'])
  }
  assert.deepEqual(format({ memory_used: 35 }), ['—', '35%', '—'])
  assert.deepEqual(config.columnsExtra, columns)
  assert.ok(config.columnsExclude.includes('stat'))
  assert.ok(!config.columnsShow.default.includes('stat'))
  for (const key of columns) assert.ok(config.columnsShow.default.includes(key))
})

test('saved status column expands in place without resetting other column preferences', () => {
  const vm = { $route: { name: 'TerminalSetting' }, tableConfig: config }
  savedColumns = ['name', 'version', 'stat', 'session_online', 'actions']
  writes = 0
  component.created.call(vm)
  assert.deepEqual(savedColumns, [
    'name',
    'version',
    'cpu_load',
    'memory_used',
    'disk_used',
    'session_online',
    'actions'
  ])
  assert.equal(writes, 1)
  component.created.call(vm)
  assert.equal(writes, 1)
  for (const saved of [undefined, ['name', 'load', 'actions']]) {
    savedColumns = saved
    component.created.call(vm)
    assert.equal(savedColumns, saved)
    assert.equal(writes, 1)
  }
})
