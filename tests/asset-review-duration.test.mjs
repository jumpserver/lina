import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(new URL('../src/views/acls/AssetLoginACL/AssetLoginAclCreateUpdate.vue', import.meta.url), 'utf8')
const { descriptor } = parse(source)
const component = new Function(
  'rules', 'ResourceSelect', 'TagInput', 'WeekCronSelect', 'GenericCreateUpdatePage',
  'InputWithUnit', 'assetJSONSelectMeta', 'AccountFormatter', 'userJSONSelectMeta',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)({}, {}, {}, {}, {}, {}, () => ({}), {}, () => ({}))

test('review duration validates whole hours and submits zero for other actions', () => {
  const config = component.data.call({ $t: (key) => key })
  const field = config.fieldsMeta.review_duration
  assert.equal(config.initial.review_duration, 0)
  assert.equal(field.hidden({ action: 'review' }), false)
  assert.equal(field.hidden({ action: 'accept' }), true)
  for (const [value, valid] of [[0, true], ['2', true], [-1, false], ['1.5', false], ['', false], [null, false], ['abc', false]]) {
    let error
    field.rules[0].validator({}, value, (result) => { error = result })
    assert.equal(!error, valid, String(value))
  }
  for (const action of ['review', 'accept', 'reject', 'notice']) {
    const result = config.cleanFormValue({ action, review_duration: '2', rules: { ip_group: ['*'] } })
    assert.equal(result.review_duration, action === 'review' ? 2 : 0)
  }
})
