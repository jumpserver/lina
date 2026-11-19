import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'

const messages = JSON.parse(
  await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
)
const slot = {
  render() {
    return Vue.h('div', this.$slots.default?.())
  }
}

async function load(name) {
  const source = await readFile(
    new URL(`../src/views/tickets/components/${name}.vue`, import.meta.url),
    'utf8'
  )
  const { descriptor } = parse(source)
  const script = descriptor.script.content
    .replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const component = new Function('IBox', 'Dialog', 'useDateTime', 'copy', 'openTaskPage', script)(
    slot,
    { render: () => null },
    () => ({ toSafeLocalDateStr: (value) => value }),
    () => {},
    () => {}
  )
  component.render = new Function(
    'Vue',
    compile(descriptor.template.content, { mode: 'function', prefixIdentifiers: true }).code
  )(Vue)
  return async (object) => {
    const app = Vue.createSSRApp({ render: () => Vue.h(component, { object }) })
    app.component('ElButton', {
      props: ['disabled'],
      render() {
        return Vue.h('button', { disabled: this.disabled }, this.$slots.default?.())
      }
    })
    app.component('ElIcon', slot)
    app.component('ElProgress', slot)
    for (const icon of ['Hide', 'View', 'CopyDocument', 'Refresh', 'Document']) {
      app.component(icon, slot)
    }
    app.config.globalProperties.$t = (key) => messages[key] || key
    return renderToString(app)
  }
}

for (const [name, prefix, extra] of [
  ['TicketSecretAccess', 'TicketSecret', ['disabled']],
  ['TicketReplayAccess', 'TicketReplay', []]
]) {
  test(`${name} renders one status while preserving expiry and recovery guidance`, async (t) => {
    t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 2000 })
    const render = await load(name)
    for (const [state, key] of [
      ['pending', 'Pending'],
      ['unapproved', 'Unapproved'],
      ['not_applicant', 'ApplicantOnly']
    ]) {
      const html = await render({ state: 'pending', result: { state } })
      assert.ok(html.includes(messages[prefix + key]), state)
      assert.equal(html.includes(messages[prefix + key + 'Help']), false, state)
      if (prefix === 'TicketReplay') assert.match(html, /<button disabled[\s>]/)
    }
    for (const state of ['expired', 'unavailable', ...extra]) {
      const key = prefix + state[0].toUpperCase() + state.slice(1)
      const expiresAt = new Date(1000).toISOString()
      const html = await render({ state: 'approved', result: { state, expires_at: expiresAt } })
      assert.ok(html.includes(messages[key]), state)
      assert.ok(html.includes(messages[key + 'Help']), state)
      if (state === 'expired') assert.ok(html.includes(expiresAt))
      if (prefix === 'TicketReplay') assert.match(html, /<button disabled[\s>]/)
    }
  })
}

test('password changes show concise progress and retain failure and verification warnings', async () => {
  const render = await load('TicketChangeSecretResult')
  for (const [state, label] of [
    ['pending', '审批通过后自动改密'],
    ['queued', '等待执行'],
    ['running', '正在改密']
  ]) {
    const html = await render({
      execution_mode: 'automatic',
      state: state === 'pending' ? 'pending' : 'approved',
      result: { state }
    })
    assert.ok(html.includes(label), state)
    assert.equal(html.includes('class="execution-help"'), false, state)
  }
  for (const [state, logTaskId, key] of [
    ['failed', 'worker', 'TicketChangeSecretLogHelp'],
    ['failed', undefined, 'TicketChangeSecretFailureHelp'],
    ['unverified', 'worker', 'TicketChangeSecretVerificationHelp'],
    ['unavailable', undefined, 'TicketChangeSecretUnavailableHelp']
  ]) {
    const finished = '2026-10-28T06:00:00Z'
    const html = await render({
      execution_mode: 'automatic',
      state: 'approved',
      result: { state, log_task_id: logTaskId, date_finished: finished }
    })
    assert.ok(html.includes(messages[key]), state)
    assert.ok(html.includes(finished), state)
    assert.equal(html.includes(messages.ExecutionLog), !!logTaskId, state)
  }
})
