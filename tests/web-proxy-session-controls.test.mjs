import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const utilsSource = await readFile(new URL('../src/utils/jms/index.js', import.meta.url), 'utf8')
const IsSupportPauseSessionType = new Function(`${utilsSource
  .replace(/^import .*$/gm, '')
  .replace(/^export \{.*$/gm, '')
  .replaceAll('export function ', 'function ')}\nreturn IsSupportPauseSessionType`)()

async function loadComponent(path, dependencies) {
  const source = await readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  return new Function(...Object.keys(dependencies), descriptor.script.content
    .replace(/^import .*$/gm, '')
    .replace('export default', 'return'))(...Object.values(dependencies))
}

const online = await loadComponent('views/sessions/SessionList/OnlineList.vue', {
  BaseList: {}, IsSupportPauseSessionType
})
const detail = await loadComponent('views/sessions/SessionDetail/SessionDetailInfo.vue', {
  TwoCol: {}, DetailCard: {}, QuickActions: {}
})
const ticket = await loadComponent('views/tickets/components/Session.vue', {
  IBox: {}, Drawer: {}, IsSupportPauseSessionType
})

test('Magnus pause and resume require a normal session and the existing session-control permission', () => {
  const row = { terminal: { type: 'magnus' }, type: { value: 'normal' }, is_locked: false }
  const context = { $t: (key) => key, $hasPerm: (perm) => perm === 'terminal.terminate_session' }
  const actions = online.data.call(context).extraActions
  const pause = actions.find((action) => action.name === 'pause')
  const resume = actions.find((action) => action.name === 'resume')
  assert.ok(pause.can({ row }) && pause.has({ row }))
  assert.ok(!resume.has({ row }))
  row.is_locked = true
  assert.ok(resume.can({ row }) && resume.has({ row }) && !pause.has({ row }))
  context.$hasPerm = () => false
  assert.ok(!pause.can({ row }) && !resume.can({ row }))
  assert.ok(ticket.computed.supportedLock.call({ session: { type: 'normal', terminal_type: 'magnus', is_finished: false } }))
})

test('built-in browser controls are disabled while HTTP(S) remote apps retain theirs', () => {
  for (const terminal of ['koko', 'lion']) {
    for (const protocol of ['http', 'https']) {
      for (const type of ['web_proxy', 'normal']) {
        const supported = type === 'normal'
        const session = {
          id: 'session', protocol, terminal: { type: terminal }, type: { value: type },
          can_join: supported, can_terminate: true, is_locked: false
        }
        const context = {
          $t: (key) => key,
          $hasPerm: () => true,
          canTerminateSessions: (rows) => rows.every((row) => row.can_terminate),
          session
        }
        const actions = online.data.call(context).extraActions
        for (const name of ['pause', 'resume', 'join']) {
          assert.equal(actions.find((action) => action.name === name).can({ row: session }), supported)
        }
        assert.equal(actions.find((action) => action.name === 'terminate').can({ row: session }), true)
        const quickActions = detail.computed.onlineSessionActions.call(context)
        assert.equal(quickActions[0].attrs.disabled, false)
        assert.equal(quickActions[1].attrs.disabled, !supported)

        assert.equal(ticket.computed.supportedLock.call({
          session: { terminal_type: terminal, type, is_finished: false }
        }), supported)
      }
    }
  }
})
