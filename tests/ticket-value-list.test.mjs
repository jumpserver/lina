import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketValueList.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(descriptor.script.content.replace('export default', 'return'))()

function list(items) {
  const context = { ...component.data(), items }
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(context, name, { get: () => getter.call(context) })
  }
  return context
}

test('collapsed lists retain every original value for the expanded view', () => {
  const items = [...Array.from({ length: 1000 }, (_, index) => `account-${index}`), 'LAST, Account']
  const context = list(items)
  assert.equal(context.compact, true)
  assert.deepEqual(context.displayValues, items)
  assert.equal(items.length, 1001)
  assert.equal(list(['root', 'root']).compact, false)
  assert.deepEqual(list(['root', 'root']).displayValues, ['root', 'root'])
  assert.equal(list(['https://example.test/' + 'x'.repeat(150)]).compact, true)
  assert.deepEqual(list([]).displayValues, [])
})
