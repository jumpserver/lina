import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import * as Vue from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { transformSync } from 'esbuild'

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
const audit = parse(await read('views/audits/AgentAudit/index.vue')).descriptor
const script = compileScript(audit, { id: 'agent-ftp-audit' })
const template = compileTemplate({
  source: audit.template.content,
  filename: 'AgentAudit.vue',
  id: 'agent-ftp-audit',
  compilerOptions: { bindingMetadata: script.bindings }
})
assert.deepEqual(template.errors, [])
function evaluate(code, require) {
  const module = { exports: {} }
  new Function('module', 'exports', 'require', transformSync(code, { format: 'cjs' }).code)(
    module,
    module.exports,
    require
  )
  return module.exports
}
const passthrough = {
  setup:
    (_, { slots }) =>
    () =>
      Vue.h('div', slots.default?.())
}

async function renderAudit(
  t,
  { permissions = [], terminalId = 'terminal-id', kind = 'sessions' } = {}
) {
  const files = []
  const calls = []
  const route = Vue.reactive({
    name: 'AgentSessionDetail',
    params: { id: 'agent-id' },
    query: { oid: 'audit-org' }
  })
  const scope = Vue.effectScope()
  t.after(() => scope.stop())
  const dependencies = {
    vue: { ...Vue, onMounted() {}, onActivated() {}, onDeactivated() {}, onBeforeUnmount() {} },
    'vue-router': { useRoute: () => route, useRouter: () => ({ hasRoute: () => false }) },
    vuex: { useStore: () => ({ getters: { currentOrg: { id: 'different-org' } } }) },
    'vue-i18n': { useI18n: () => ({ t: (key) => key }) },
    '@/utils/jms/permission': { hasPermission: (permission) => permissions.includes(permission) },
    '@/utils/request': (...args) => calls.push(args),
    '@/composables/useDateTime': { toSafeLocalDateStr: (value) => value },
    './output': { evidenceOutput: () => [] },
    './routes': { agentAuditRoute: () => ({}) },
    '@/views/sessions/SessionDetail/SessionFTPLogs.vue': {
      props: ['object'],
      setup(props) {
        files.push(props.object)
        return () => Vue.h('div', { 'data-ftp-session': props.object.id })
      }
    }
  }
  const component = evaluate(script.content, (id) => dependencies[id] || passthrough).default
  const state = scope.run(() => component.setup({ kind }, { expose() {} }))
  state.active.value = true
  state.activeMenu.value = 'FileTransfer'
  state.item.value = { id: 'agent-id', terminal_session_id: terminalId, org_id: 'audit-org' }
  const render = evaluate(template.code, () => Vue).render
  const app = Vue.createSSRApp({ props: ['kind'], setup: () => state, render }, { kind })
  for (const name of [
    'el-button',
    'el-alert',
    'el-skeleton',
    'el-link',
    'el-collapse',
    'el-collapse-item'
  ]) {
    app.component(name, passthrough)
  }
  app.component('el-empty', { render: () => Vue.h('div', { 'data-empty': true }) })
  const html = await renderToString(app)
  return { files, calls, html, tabs: state.detailTabs.value }
}

test('Agent FTP audit uses the bound terminal and record organization without requiring terminal audit permission', async (t) => {
  const result = await renderAudit(t, { permissions: ['audits.view_ftplog'] })
  assert.ok(result.tabs.some((tab) => tab.name === 'FileTransfer'))
  assert.deepEqual(result.files, [{ id: 'terminal-id', org_id: 'audit-org' }])
  assert.deepEqual(result.calls, [])
})

test('FTP permission and missing bindings prevent a broad file audit request', async (t) => {
  const denied = await renderAudit(t, { permissions: ['terminal.view_agentaction'] })
  assert.ok(!denied.tabs.some((tab) => tab.name === 'FileTransfer'))
  assert.deepEqual(denied.files, [])
  const unbound = await renderAudit(t, { permissions: ['audits.view_ftplog'], terminalId: null })
  assert.deepEqual(unbound.files, [])
  assert.match(unbound.html, /data-empty/)
})

test('existing FTP list scopes both queries and retained downloads to the audit organization', async () => {
  const descriptor = parse(await read('views/sessions/SessionDetail/SessionFTPLogs.vue')).descriptor
  const downloads = []
  const component = new Function(
    'ListTable',
    'OverflowTooltipFormatter',
    'download',
    descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
  )({}, {}, (url) => downloads.push(url))
  for (const orgId of ['audit-org', undefined]) {
    const data = component.data.call({
      object: { id: 'bound-session', org_id: orgId },
      $t: (key) => key
    })
    const query = new URL(data.tableConfig.url, 'http://localhost')
    assert.equal(query.searchParams.get('session'), 'bound-session')
    assert.equal(query.searchParams.get('oid'), orgId || null)
    data.tableConfig.columnsMeta.actions.formatterArgs.extraActions[0].callback({
      row: { id: 'file-id' }
    })
    const download = new URL(downloads.at(-1), 'http://localhost')
    assert.equal(download.searchParams.get('oid'), orgId || null)
  }
})

test('global FTP audit preserves the all-records endpoint and filters Agent transfers on the server', async () => {
  const descriptor = parse(await read('views/sessions/FTPLogList.vue')).descriptor
  const downloads = []
  const component = new Function(
    'GenericListPage',
    'GenericListTable',
    'ChoicesFormatter',
    'OverflowTooltipFormatter',
    'download',
    'store',
    descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
  )({}, {}, {}, {}, (url) => downloads.push(url), {})
  for (const category of ['', 'agent']) {
    const data = component.data.call({ category, orgId: 'audit-org', $t: (key) => key })
    const query = new URL(data.tableConfig.url, 'http://localhost')
    assert.equal(query.searchParams.get('category'), category || null)
    assert.equal(query.searchParams.get('oid'), 'audit-org')
    assert.ok(data.tableConfig.columnsShow.default.includes('login_from'))
    data.tableConfig.columnsMeta.actions.formatterArgs.extraActions[0].callback({
      row: { id: 'file-id' }
    })
    assert.equal(new URL(downloads.at(-1), 'http://localhost').searchParams.get('oid'), 'audit-org')
  }
})
