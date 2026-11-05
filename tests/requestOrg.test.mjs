import test from 'node:test'
import assert from 'node:assert/strict'
import { getRequestOrgId } from '../src/utils/requestOrg.js'

test('a direct business result link scopes startup requests to the target organization', () => {
  const route = { query: {}, matched: [] }
  const hash = '#/console/perms/asset-permissions/grant?oid=target-org'
  assert.equal(getRequestOrgId(route, 'previous-org', hash), 'target-org')
})

test('the active route wins after navigation and a stale hash cannot change request scope', () => {
  const hash = '#/console/perms/asset-permissions/grant?oid=stale-org'
  assert.equal(
    getRequestOrgId({ query: { oid: 'active-org' }, matched: [{}] }, 'stored-org', hash),
    'active-org'
  )
  assert.equal(getRequestOrgId({ query: {}, matched: [{}] }, 'stored-org', hash), 'stored-org')
})

test('ordinary startup requests retain the selected organization', () => {
  for (const hash of ['', '#/console', '#/console?tab=details', '#/console?oid=']) {
    assert.equal(getRequestOrgId({ query: {}, matched: [] }, 'stored-org', hash), 'stored-org')
  }
})
