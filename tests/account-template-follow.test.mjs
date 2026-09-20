import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(new URL('../src/components/Apps/AccountCreateUpdateForm/const.js', import.meta.url), 'utf8')
const dependencies = ['ResourceSelect', 'NodeSelect', 'UpdateToken', 'UploadSecret', 'Select2', 'Required', 'RequiredChange', 'AutomationParamsForm']
const accountFieldsMeta = new Function(...dependencies,
  source.replace(/^import .*$/gm, '').replace(/export const /g, 'const ') + '\nreturn accountFieldsMeta'
)(...dependencies.map(() => ({})))

function createFields() {
  const vm = {
    $t: (key) => key,
    account: { name: 'user', source: 'template', source_id: 'template-id', follow_template: true },
    followingTemplate: true,
    addTemplate: false,
    isDisabled: false
  }
  return { vm, fields: accountFieldsMeta(vm) }
}

test('turning off template following immediately unlocks editable fields', () => {
  const { vm, fields } = createFields()
  for (const key of ['secret_type']) {
    assert.equal(fields[key].el.disabled, true)
  }
  fields.follow_template.on.change([false])
  for (const key of ['secret_type']) {
    assert.equal(fields[key].el.disabled, false)
  }
  assert.equal(vm.account.follow_template, true, 'do not mutate the saved account before submitting')
  assert.equal(fields.username.el.disabled, true, 'usernames remain immutable')
  fields.follow_template.on.change([true])
  assert.equal(fields.name.el.disabled, false, 'account names remain independent while following')
  assert.equal(fields.privileged.el.disabled, false, 'privilege settings remain independent while following')
})

test('credential visibility follows the current form instead of the saved account', () => {
  const { fields } = createFields()
  for (const secretType of ['password', 'ssh_key', 'token', 'access_key', 'api_key']) {
    assert.equal(fields[secretType].hidden({ secret_type: secretType, follow_template: true }), true)
    assert.equal(fields[secretType].hidden({ secret_type: secretType, follow_template: false }), false)
  }
  assert.equal(fields.passphrase.hidden({ secret_type: 'ssh_key', follow_template: false }), false)
})
