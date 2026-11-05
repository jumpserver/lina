import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/acls/AssetLoginACL/AssetLoginAclCreateUpdate.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(
  'Select2',
  'rules',
  'ResourceSelect',
  'TagInput',
  'WeekCronSelect',
  'GenericCreateUpdatePage',
  'InputWithUnit',
  'assetJSONSelectMeta',
  'AccountFormatter',
  'userJSONSelectMeta',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)(
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  () => ({}),
  {},
  () => ({})
)

test('review fields are visible only for accepting rules with approval enabled', () => {
  const config = component.data.call({ $t: (key) => key, $store: { getters: { currentOrg: { id: 'org-id' } } } })
  assert.equal(config.initial.review_enabled, false)
  assert.equal(config.initial.review_duration, 0)

  for (const [action, review_enabled, hidden] of [
    ['accept', true, false],
    ['accept', false, true],
    ['reject', true, true],
    ['reject', false, true]
  ]) {
    const form = { action, review_enabled }
    assert.equal(config.fieldsMeta.reviewers.hidden(form), hidden)
    assert.equal(config.fieldsMeta.review_duration.hidden(form), hidden)
  }
})

test('review duration accepts zero and whole hours within the supported range', () => {
  const config = component.data.call({ $t: (key) => key, $store: { getters: { currentOrg: { id: 'org-id' } } } })
  const field = config.fieldsMeta.review_duration
  for (const [value, valid] of [
    [0, true],
    ['2', true],
    [2147483647, true],
    [2147483648, false],
    [-1, false],
    ['1.5', false],
    ['', false],
    [null, false],
    [undefined, false],
    ['abc', false]
  ]) {
    let error
    field.rules[0].validator({}, value, (result) => {
      error = result
    })
    assert.equal(!error, valid, String(value))
  }
})

test('submission preserves approval configuration when approval is disabled or action is rejected', () => {
  const config = component.data.call({ $t: (key) => key, $store: { getters: { currentOrg: { id: 'org-id' } } } })
  for (const action of ['accept', 'reject']) {
    for (const review_enabled of [true, false]) {
      const form = {
        action,
        review_enabled,
        review_duration: '2',
        reviewers: ['reviewer-id'],
        notice_enabled: true,
        recipients: ['recipient-id'],
        rules: { ip_group: ['*'] }
      }
      const result = config.cleanFormValue(structuredClone(form))
      assert.deepEqual(result, { ...form, workflow: null, review_duration: 2 })
    }
  }
})

test('submission normalizes an unset review duration to zero without changing the approval flag', () => {
  const config = component.data.call({ $t: (key) => key, $store: { getters: { currentOrg: { id: 'org-id' } } } })
  for (const review_duration of [undefined, null, '', 0]) {
    const result = config.cleanFormValue({
      action: 'accept',
      review_enabled: true,
      review_duration,
      reviewers: [],
      rules: { ip_group: ['*'] }
    })
    assert.equal(result.review_duration, 0)
    assert.equal(result.review_enabled, true)
    assert.deepEqual(result.reviewers, [])
  }
})

 test('workflow selection replaces fixed reviewers and is preserved when controls are disabled', () => {
  const config = component.data.call({ $t: (key) => key, $store: { getters: { currentOrg: { id: 'org-id' } } } })
  const form = { action: 'accept', review_enabled: true, workflow: 'workflow-id', rules: { ip_group: ['*'] } }
  assert.equal(config.fieldsMeta.workflow.hidden(form), false)
  assert.equal(config.fieldsMeta.reviewers.hidden(form), true)
  assert.equal(config.fieldsMeta.review_duration.hidden(form), false)
  assert.equal(config.fieldsMeta.workflow.hidden({ ...form, review_enabled: false }), true)
  assert.equal(config.cleanFormValue({ ...form, action: 'reject' }).workflow, 'workflow-id')
 })
