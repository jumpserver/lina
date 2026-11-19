import test from 'node:test'
import assert from 'node:assert/strict'
import { compileFunction } from 'node:vm'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/components/Session.vue', import.meta.url),
  'utf8'
)
const code = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const panel = compileFunction(code, ['IBox', 'Drawer', 'IsSupportPauseSessionType'])(
  {},
  {},
  (type) => type === 'koko'
)

test('session selection is stable after a refresh and controls target the selected session and organization', async (t) => {
  const sessions = [
    { id: 'first', org_id: 'first-org' },
    { id: 'second', org_id: 'asset-org', terminal_type: 'koko', type: 'normal', is_finished: false }
  ]
  const vm = {
    ...panel.data(),
    object: { id: 'ticket', org_id: 'ticket-org' },
    sessions,
    selectedId: 'second'
  }
  const session = panel.computed.session.call(vm)
  assert.equal(
    panel.computed.session.call({ ...vm, sessions: [...sessions].reverse() }).id,
    'second'
  )
  assert.equal(panel.computed.supportedLock.call({ session }), true)
  assert.equal(
    panel.computed.supportedLock.call({ session: { ...session, is_finished: true } }),
    false
  )
  const open = t.mock.fn()
  const previous = globalThis.window
  globalThis.window = { open }
  t.after(() => {
    if (previous === undefined) delete globalThis.window
    else globalThis.window = previous
  })
  panel.methods.onMonitor.call({ ...vm, session })
  const url = new URL(open.mock.calls[0].arguments[0], 'https://example.test')
  assert.equal(url.pathname, '/luna/monitor/second')
  assert.equal(url.searchParams.get('ticket_id'), 'ticket')
  assert.equal(url.searchParams.get('oid'), 'asset-org')

  const post = t.mock.fn(async () => ({ ok: ['second'] }))
  Object.assign(vm, { session, $axios: { post }, $message: { success() {} }, $t: (key) => key })
  for (const task of ['lock_session', 'unlock_session', 'kill_session']) {
    await panel.methods.sendTask.call(vm, task)
    const [, body, config] = post.mock.calls.at(-1).arguments
    assert.deepEqual(
      body,
      task === 'kill_session' ? ['second'] : { session_id: 'second', task_name: task }
    )
    assert.equal(config.params.oid, 'asset-org')
  }
})

test('an unmounted ticket cannot repopulate the sessions or restart polling', async () => {
  const request = Promise.withResolvers()
  const vm = { ...panel.data(), object: { id: 'previous' }, $axios: { get: () => request.promise } }
  const pending = panel.methods.loadSessions.call(vm)
  panel.beforeUnmount.call(vm)
  request.resolve([{ id: 'stale' }])
  await pending
  assert.deepEqual(vm.sessions, [])
  assert.equal(vm.timer, null)
})
