import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
const source = await readFile(new URL('../src/utils/accountTemplateFollowing.js', import.meta.url), 'utf8')
const { isTemplateFollowingConflict, retryWithoutTemplateFollowing } = await import(`data:text/javascript,${encodeURIComponent(source)}`)
const makeError = (data = { secret: 'encrypted-value' }) => ({
  config: { url: '/api/v1/accounts/accounts/account-id/', method: 'patch', data: JSON.stringify(data) },
  response: { status: 409, data: { code: 'account_template_following' } }
})

test('only account credential conflicts trigger confirmation and retry once', () => {
  const error = makeError()
  assert.equal(isTemplateFollowingConflict(error), true)
  error.config.templateFollowingRetried = true
  assert.equal(isTemplateFollowingConflict(error), false)
  delete error.config.templateFollowingRetried
  error.response.data.code = 'other_error'
  assert.equal(isTemplateFollowingConflict(error), false)
  error.response.data.code = 'account_template_following'
  error.config.url = '/api/v1/accounts/account-templates/id/'
  assert.equal(isTemplateFollowingConflict(error), false)
})

test('confirmed retry keeps the credential payload and disables following', async () => {
  const error = makeError()
  let confirmed = false
  const result = await retryWithoutTemplateFollowing(error, async () => { confirmed = true }, async (config) => {
    assert.equal(confirmed, true)
    assert.deepEqual(config.data, { secret: 'encrypted-value', follow_template: false })
    assert.equal(config.templateFollowingRetried, true)
    return 'saved'
  })
  assert.equal(result, 'saved')
  assert.equal(JSON.parse(error.config.data).follow_template, undefined)
})

test('cancel leaves the request unchanged without retrying', async () => {
  const error = makeError()
  await assert.rejects(retryWithoutTemplateFollowing(error, async () => { throw new Error('cancel') }, () => {
    assert.fail('must not retry')
  }), (rejected) => rejected === error && rejected.templateFollowCancelled)
  assert.equal(JSON.parse(error.config.data).follow_template, undefined)
})

test('batch credential edits and clears retain all original targets', async () => {
  for (const data of [[{ id: 'a', secret: 'encrypted' }, { id: 'b', secret: 'encrypted' }], { account_ids: ['a', 'b'] }]) {
    const error = makeError(data)
    error.config.url = Array.isArray(data) ? '/api/v1/accounts/accounts/' : '/api/v1/accounts/accounts/clear-secret/'
    assert.equal(isTemplateFollowingConflict(error), true)
    await retryWithoutTemplateFollowing(error, async () => {}, async ({ data: retried }) => {
      const expected = Array.isArray(data) ? data.map(item => ({ ...item, follow_template: false })) : { ...data, follow_template: false }
      assert.deepEqual(retried, expected)
    })
  }
})

test('retry failures propagate without another confirmation', async () => {
  const failure = new Error('save failed')
  await assert.rejects(retryWithoutTemplateFollowing(makeError(), async () => {}, async () => { throw failure }), error => error === failure)
})
