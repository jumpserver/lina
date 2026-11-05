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

test('built-in browser controls are disabled while HTTP(S) remote apps retain theirs', async () => {
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

        const ticketContext = {
          object: { id: 'ticket' },
          $axios: () => Promise.resolve(session)
        }
        ticket.methods.init.call(ticketContext)
        // Let the existing request callback apply the capability decision.
        await Promise.resolve()
        assert.equal(ticketContext.supportedLock, supported)
        assert.equal(ticketContext.session.can_join, supported)
      }
    }
  }
})
