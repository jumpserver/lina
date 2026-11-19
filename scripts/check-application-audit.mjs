import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')
const source = await read('src/views/accounts/Integration/components/applicationAudit.js')
const { normalizeAudit, validNotificationUrl } = await import(
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
)
const t = (key) => key
const row = normalizeAudit(
  {
    event: 'client_disabled',
    result: 'success',
    instance_id: 'node-1',
    changes: [{ field: 'is_active', before: true, after: false }],
    notification: null
  },
  t
)
assert.equal(row.event_display, 'AppAuditClientDisabled')
assert.equal(row.changes[0].after, 'false')
assert.equal(
  normalizeAudit({ event: 'new_event', result: 'success' }, t).event_display,
  'new_event'
)
const notification = normalizeAudit(
  {
    event: 'notification',
    result: 'retrying',
    notification: { attempts: [{ result: 'failed', reason: 'http_failed' }] }
  },
  t
)
assert.equal(notification.notification.attempts[0].result, 'Failed')
for (const url of ['http://127.0.0.1:9000/events', 'https://app.example.com/events'])
  assert.ok(validNotificationUrl(url))
for (const url of [
  '',
  'ftp://app.example.com',
  'https://user:secret@app.example.com',
  'https://app.example.com/#token'
])
  assert.equal(validNotificationUrl(url), false)
for (const path of ['ApplicationDetail/index.vue', 'AccountRotationDetail/index.vue']) {
  assert.doesNotMatch(
    await read('src/views/accounts/Integration/' + path),
    /ApplicationAudit|AppAuditLogs|CallRecords/
  )
}
for (const path of [
  'components/ApplicationAudit.vue',
  'ApplicationDetail/ClientAccessPrototype.vue',
  'ApplicationDetail/ClientAccessCreateUpdate.vue',
  'index.vue'
]) {
  const content = await read('src/views/accounts/Integration/' + path)
  assert.doesNotMatch(
    content,
    /auditPreview|previewSave|previewConfigurations|notification_auth|notification_token|service-access-logs/
  )
}
const list = await read('src/views/accounts/Integration/components/ApplicationAudit.vue')
assert.match(list, /application-audits/)
assert.match(list, /response.data.results.map/)
assert.match(list, /hasDatePicker: true/)
assert.match(list, /await request.get\(\x60\/api\/v1\/accounts\/application-audits\//)
const form = await read(
  'src/views/accounts/Integration/ApplicationDetail/ClientAccessCreateUpdate.vue'
)
assert.match(form, /!form.notification_enabled \|\| form.type !== 'agent'/)
const detail = await read('src/views/accounts/Integration/components/ApplicationAuditDetail.vue')
assert.equal((detail.match(/AppAuditReceivedOnly/g) || []).length, 1)
console.log('Real audit API, optional notification form, and detail contracts passed')
