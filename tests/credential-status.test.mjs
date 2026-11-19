import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { credentialStatusLabel } from '../src/views/accounts/Integration/components/credentialStatus.js'

const zh = JSON.parse(await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8'))
const t = (key) => zh[key] || key
const credential = { mode: 'alternating_rotation', is_active: true, status: 'waiting_switch' }

test('list status describes the source observation after applications have switched', () => {
  assert.equal(credentialStatusLabel(credential, t), '等待应用切换账号')
  assert.equal(
    credentialStatusLabel({ ...credential, rotation_phase: 'waiting_switch' }, t),
    '等待应用切换账号'
  )
  assert.equal(
    credentialStatusLabel({ ...credential, rotation_phase: 'waiting_source' }, t),
    '等待原主账号无取密'
  )
})

test('detail status follows live readiness while the workflow state remains waiting_switch', () => {
  assert.equal(
    credentialStatusLabel(credential, t, {
      credential_status: 'waiting_switch',
      rotation_phase: 'waiting_source'
    }),
    '等待原主账号无取密'
  )
  assert.equal(
    credentialStatusLabel({ ...credential, rotation_phase: 'waiting_source' }, t, {
      credential_status: 'waiting_switch',
      rotation_phase: 'waiting_switch'
    }),
    '等待应用切换账号'
  )
})

test('stale observation phases cannot override later workflow states', () => {
  assert.equal(
    credentialStatusLabel(
      {
        ...credential,
        status: 'ready_for_change',
        rotation_phase: 'waiting_source'
      },
      t,
      { credential_status: 'waiting_switch', rotation_phase: 'waiting_source' }
    ),
    zh.ReadyForSecretChange
  )
})

test('observation status preserves disabled and subscription labels', () => {
  assert.equal(
    credentialStatusLabel(
      {
        ...credential,
        is_active: false,
        rotation_phase: 'waiting_source'
      },
      t
    ),
    `${zh.Disabled} · 等待原主账号无取密`
  )
  assert.equal(credentialStatusLabel({ ...credential, mode: 'subscription' }, t), zh.Enabled)
})
