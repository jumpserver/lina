import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const apiSource = await readFile(
  new URL('../src/api/applicationCredential.js', import.meta.url),
  'utf8'
)
const requests = []
const request = Object.fromEntries(
  ['post', 'patch'].map((method) => [
    method,
    async (url, data) => {
      requests.push({ method, url, data })
      return { ...data, status: 'idle' }
    }
  ])
)
const { saveApplicationCredential } = new Function(
  'request',
  apiSource.replace(/^import .*\n/gm, '').replace(/export /g, '') +
    '\nreturn { saveApplicationCredential }'
)(request)

const form = {
  name: 'test',
  mode: 'alternating_rotation',
  account_id: 'a',
  alternate_account_id: 'b'
}

test('new rotation policies default to server verification in API requests', async () => {
  await saveApplicationCredential(form)
  assert.equal(requests.at(-1).method, 'post')
  assert.equal(requests.at(-1).data.verify_before_switch, true)
})

test('explicitly disabling verification survives create and update', async () => {
  for (const id of [undefined, 'policy']) {
    await saveApplicationCredential({ ...form, id, verify_before_switch: false })
    assert.equal(requests.at(-1).method, id ? 'patch' : 'post')
    assert.equal(requests.at(-1).data.verify_before_switch, false)
  }
})

test('subscription requests do not send rotation verification settings', async () => {
  await saveApplicationCredential({ ...form, mode: 'subscription', verify_before_switch: false })
  assert.equal(Object.hasOwn(requests.at(-1).data, 'verify_before_switch'), false)
})

const source = await readFile(
  new URL('../src/views/accounts/Integration/AccountRotationCreateUpdate.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*\n/gm, '')
  .replace('export default', 'return')
const component = new Function(
  'GenericCreateUpdatePage',
  'Select2',
  'rules',
  'credentialUrl',
  'saveApplicationCredential',
  'subscribedAccountLabel',
  script
)(null, null, {}, '/policies/', saveApplicationCredential, (value) => value)

test('policy checkbox defaults on and preserves existing false values', () => {
  for (const value of [undefined, false, true]) {
    const { formConfig } = component.data.call({
      credential: { verify_before_switch: value },
      mode: 'alternating_rotation',
      $t: (key) => key
    })
    assert.equal(formConfig.initial.verify_before_switch, value ?? true)
    assert.equal(formConfig.fieldsMeta.verify_before_switch.type, 'checkbox')
    assert.equal(
      formConfig.fieldsMeta.verify_before_switch.hidden({ mode: 'alternating_rotation' }),
      false
    )
    assert.equal(formConfig.fieldsMeta.verify_before_switch.hidden({ mode: 'subscription' }), true)
  }
})
