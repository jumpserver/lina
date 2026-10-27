import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, ref } from 'vue'

const source = await readFile(
  new URL('../src/views/ops/Template/components/Variable.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const Variable = new Function('AddVariableDialog', script)({})
Variable.render = () => null

function mountVariables(t, initial = []) {
  const variables = ref(initial)
  const saved = []
  const component = ref()
  const renderer = createRenderer({
    createComment: () => ({}),
    insert() {},
    remove() {},
    parentNode: () => null,
    nextSibling: () => null
  })
  const app = renderer.createApp({
    render: () =>
      h(Variable, {
        ref: component,
        modelValue: variables.value,
        'onUpdate:modelValue': (value) => (variables.value = value),
        onInput: (value) => saved.push(structuredClone(value.map((item) => ({ ...item }))))
      })
  })
  app.mount({})
  t.after(() => app.unmount())
  return { variables, saved, component }
}

const variable = (id) => ({ id, name: id, var_name: `jms_${id}`, default_value: undefined })

test('removing the last variable after workspace loading saves an empty list', async (t) => {
  const { variables, saved, component } = mountVariables(t)
  variables.value = [variable('copied')]
  await nextTick()
  saved.length = 0

  component.value.removeVariable(variables.value[0])
  await nextTick()

  assert.deepEqual(variables.value, [])
  assert.deepEqual(saved, [[]])
})

test('partial deletion, clearing and adding again all persist', async (t) => {
  const { variables, saved, component } = mountVariables(t, [variable('first'), variable('second')])
  component.value.removeVariable(variables.value[0])
  await nextTick()
  assert.deepEqual(saved.at(-1), [variable('second')])

  component.value.removeVariable(variables.value[0])
  await nextTick()
  assert.deepEqual(saved.at(-1), [])

  component.value.addVariable(variable('new'))
  await nextTick()
  assert.deepEqual(saved.at(-1), [variable('new')])
})

test('mounting an existing template does not save its variables', async (t) => {
  const { saved } = mountVariables(t, [variable('existing')])
  await nextTick()
  assert.deepEqual(saved, [])
})
