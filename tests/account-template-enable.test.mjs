import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
const source = await readFile(new URL('../src/components/Apps/AccountCreateUpdateForm/index.vue', import.meta.url), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
const component = new Function('AutoDataForm', 'encryptPassword', 'accountFieldsMeta', 'getSecretTypeOptions',
  script.replace(/import[\s\S]*?from ['"][^'"]+['"]/g, '').replace('export default', 'return')
)({}, value => value, () => ({}), () => [])

test('enabling following confirms credential replacement before submitting', async () => {
  const events = []
  const vm = { account: { name: 'user', follow_template: false }, $t: key => key,
    $confirm: async message => events.push(message), $emit: event => events.push(event) }
  await component.methods.confirm.call(vm, { follow_template: true, secret_type: 'password' })
  assert.deepEqual(events, ['FollowTemplateEnableConfirm', 'edit'])
})

test('canceling re-enable preserves the form and sends no update', async () => {
  const form = { follow_template: true, password: 'draft' }
  const vm = { account: { name: 'user', follow_template: false }, $t: key => key,
    $confirm: async () => { throw new Error('cancel') }, $emit: () => assert.fail('must not submit') }
  await component.methods.confirm.call(vm, form)
  assert.deepEqual(form, { follow_template: true, password: 'draft' })
})

test('existing followers and opt-out do not show the opt-in confirmation', async () => {
  for (const [previous, next] of [[true, true], [true, false], [false, false]]) {
    let emitted = false
    const vm = { account: { name: 'user', follow_template: previous },
      $confirm: () => assert.fail('unexpected confirmation'), $emit: () => { emitted = true } }
    await component.methods.confirm.call(vm, { follow_template: next })
    assert.equal(emitted, true)
  }
})
