import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { compileFunction } from 'node:vm'
import _ from 'lodash'
import { reactive } from 'vue'

const source = await readFile(new URL('../src/views/assets/const.js', import.meta.url), 'utf8')
const script = source.replace(/^import [\s\S]*?from ['"][^'"]+['"]/gm, '').replace(/^export /gm, '')
const bindings = {
  _,
  reactive,
  i18n: { t: (key) => key },
  rules: {},
  ProtocolSelector: {},
  AssetAccounts: {},
  ResourceSelect: {},
  TreeResourceSelect: {},
  ColorSwatchFormatter: {}
}
const assetFieldsMeta = compileFunction(
  `${script}\nreturn assetFieldsMeta`,
  Object.keys(bindings)
)(...Object.values(bindings))

test('a Web asset clone retains its login settings when the platform selection returns to its origin', async () => {
  const vm = {
    $t: (key) => key,
    $context: { get: (key) => ({ action: 'clone', id: '' })[key] },
    platformID: 1,
    iConfig: {},
    platform: { protocols: [{ name: 'http', setting: { autofill: 'basic', script: [] } }] },
    setInitial: async () => true,
    setPlatformConstrains: async () => {}
  }
  const { change } = assetFieldsMeta(vm, 'web', 'website').platform.on
  const form = { autofill: 'script', script: ['custom login'] }
  const updateForm = (values) => Object.assign(form, values)

  change([{ pk: 2 }], updateForm)
  change([{ pk: 1 }], updateForm)
  await change.flush()
  assert.deepEqual(form, { autofill: 'script', script: ['custom login'] })

  change([{ pk: 2 }], updateForm)
  await change.flush()
  assert.equal(form.autofill, 'basic')
  assert.deepEqual(form.script, [])
})
