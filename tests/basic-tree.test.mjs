import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/components/Form/FormFields/BasicTree.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const component = new Function('ElTooltip', script)({})

test('tree selection emits leaf actions and respects temporary disabled and readonly states', () => {
  const events = []
  const vm = { disabled: false, readonly: false, $emit: (...args) => events.push(args) }
  const props = component.data.call(vm).defaultProps
  const leaf = Object.freeze({ value: 'download', label: 'Download' })
  const parent = Object.freeze({ value: 'Transfer', children: [leaf] })
  const selection = { checkedNodes: [parent, leaf] }
  component.methods.handleCheckChange.call(vm, parent, selection)
  assert.ok(events.length > 0)
  for (const [, values] of events) assert.deepEqual(values, ['download'])
  const count = events.length
  vm.disabled = true
  assert.equal(props.disabled(leaf), true)
  component.methods.handleCheckChange.call(vm, parent, selection)
  assert.equal(events.length, count)
  vm.disabled = false
  vm.readonly = true
  assert.equal(props.disabled(leaf), true)
  component.methods.handleCheckChange.call(vm, parent, selection)
  assert.equal(events.length, count)
  vm.readonly = false
  assert.ok(!props.disabled(leaf))
  assert.equal(props.disabled({ ...leaf, disabled: true }), true)
  assert.equal(Object.hasOwn(leaf, 'disabled'), false)
})
