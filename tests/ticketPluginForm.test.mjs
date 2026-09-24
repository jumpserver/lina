import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRequestPayload } from '../src/views/tickets/plugins/form.js'

test('plugin submission includes only declared parameters and preserves literal file paths', () => {
  const payload = buildRequestPayload(
    {
      type: 'file_transfer',
      fields: [
        { name: 'paths', type: 'list', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'optional', type: 'string' }
      ]
    },
    {
      title: 'Download',
      org_id: 'org',
      workflow_id: 'flow',
      param_paths: ' /tmp/a,b.txt\n\n/tmp/c.txt ',
      param_duration: 600,
      param_optional: '',
      applicant: 'someone-else',
      param_secret: 'must-not-send'
    }
  )
  assert.deepEqual(payload, {
    type: 'file_transfer',
    title: 'Download',
    org_id: 'org',
    workflow_id: 'flow',
    comment: '',
    request_data: { paths: ['/tmp/a,b.txt', '/tmp/c.txt'], duration: 600 }
  })
})
