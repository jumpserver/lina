import test from 'node:test'
import assert from 'node:assert/strict'
import {
  approvalActionMeta,
  approvalFormValue,
  cleanApprovalFormValue,
  approvalActionLabel
} from '../src/views/acls/approval.js'

const t = (key) => key

test('approval choices preserve notification and license filtering', () => {
  const meta = { action: { choices: [{ value: 'review', label: 'Review' }, { value: 'notice', label: 'Notice' }] } }
  assert.deepEqual(approvalActionMeta(meta, t).action.choices, [
    { value: 'review', label: 'SimpleApproval' },
    { value: 'workflow_review', label: 'WorkflowApproval' },
    { value: 'notice', label: 'Notice' }
  ])
  assert.deepEqual(approvalActionMeta({ action: { choices: [] } }, t).action.choices, [])
})

test('existing ACLs round trip without changing reviewers or workflow bindings', () => {
  for (const action of ['review', { value: 'review', label: 'Review' }]) {
    for (const workflow of [null, 'configured-flow']) {
      const value = { action, workflow, reviewers: ['original-reviewer'] }
      const form = approvalFormValue(value)
      assert.equal(form.action, workflow ? 'workflow_review' : 'review')
      assert.deepEqual(cleanApprovalFormValue(form), { ...value, action: 'review' })
    }
  }
})

test('switching to simple approval clears the selected workflow and keeps reviewers', () => {
  const value = { action: 'review', workflow: 'configured-flow', reviewers: ['original-reviewer'] }
  assert.deepEqual(cleanApprovalFormValue(value), { ...value, workflow: null })
  assert.equal(approvalActionLabel({ action: { value: 'review' }, workflow: null }, t), 'SimpleApproval')
  assert.equal(approvalActionLabel({ action: { value: 'review' }, workflow: 'flow' }, t), 'WorkflowApproval')
})
