import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, ref } from 'vue'
const source = await readFile(
  new URL('../src/components/Form/FormFields/ProtocolSelector/index.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const component = new Function('ProtocolSettingDialog', script)({})
component.render = () => null

async function mountSelector(t, settingReadonly = false) {
  const model = ref([
    { name: 'ssh', port: 22 },
    { name: 'sftp', port: 22 }
  ])
  const selector = ref()
  const inputs = []
  const renderer = createRenderer({
    createComment: () => ({}),
    insert() {},
    remove() {},
    parentNode: () => null,
    nextSibling: () => null
  })
  const choices = [
    { name: 'ssh', port: 22 },
    { name: 'sftp', port: 22 },
    { name: 'telnet', port: 23, setting: { timeout: 10 } }
  ]
  const app = renderer.createApp({
    render: () =>
      h(component, {
        ref: selector,
        modelValue: model.value,
        choices,
        settingReadonly,
        'onUpdate:modelValue': (value) => {
          model.value = value
        },
        onInput: (value) => inputs.push(JSON.parse(JSON.stringify(value)))
      })
  })
  app.config.globalProperties.$log = { debug() {} }
  app.mount({})
  t.after(() => app.unmount())
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
  return { model, selector, inputs }
}

test('platform protocol additions and deletions update the parent model and legacy input', async (t) => {
  const { model, selector, inputs } = await mountSelector(t)
  selector.value.handleAdd(1)
  await nextTick()
  assert.deepEqual(
    model.value.map((item) => item.name),
    ['ssh', 'sftp', 'telnet']
  )
  assert.deepEqual(inputs.at(-1), JSON.parse(JSON.stringify(model.value)))
  selector.value.handleDelete(1)
  await nextTick()
  assert.deepEqual(
    model.value.map((item) => item.name),
    ['ssh', 'telnet']
  )
  assert.deepEqual(inputs.at(-1), JSON.parse(JSON.stringify(model.value)))
})

test('asset protocol changes emit only names and ports through both supported events', async (t) => {
  const { model, selector, inputs } = await mountSelector(t, true)
  selector.value.handleAdd(1)
  await nextTick()
  const expected = [
    { name: 'ssh', port: 22 },
    { name: 'sftp', port: 22 },
    { name: 'telnet', port: 23 }
  ]
  assert.deepEqual(JSON.parse(JSON.stringify(model.value)), expected)
  assert.deepEqual(inputs.at(-1), expected)
})
