import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'

const source = await readFile(
  new URL('../src/views/tickets/components/WorkflowPanel.vue', import.meta.url),
  'utf8'
)
const rule = parse(source).descriptor.template.content.match(
  /<div class="step-description hint">[\s\S]*?<\/div>/
)[0]
const render = new Function(
  'Vue',
  compile(rule, { mode: 'function', prefixIdentifiers: true }).code
)(Vue)
const messages = JSON.parse(
  await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
)

test('approval rules render one explanation and retain the actual quorum', async () => {
  for (const [strategy, required, expected] of [
    ['any', 1, '或签（一人通过）'],
    ['all', 5, '会签（全部通过）'],
    ['quorum', 3, '需 3 人通过']
  ]) {
    const app = Vue.createSSRApp({
      render,
      setup: () => ({
        node: { config: { strategy }, required }
      })
    })
    app.config.globalProperties.$t = (key, params) =>
      messages[key].replace('{count}', params?.count)
    const html = await renderToString(app)
    assert.equal(html.replace(/<[^>]*>/g, '').trim(), expected)
  }
})

const panel = new Function(
  'IBox',
  'Dialog',
  'WorkflowMemberSelect',
  'CcUsers',
  'TicketValueList',
  'useDateTime',
  parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
)({}, {}, {}, {}, {}, () => ({}))

test('approval nodes show their configured source beside the approval strategy', async () => {
  for (const [approvers, names, expected] of [
    [{ type: 'user', value: ['user'] }, {}, '指定用户'],
    [{ type: 'user_group', value: ['group'] }, {}, '用户组'],
    [{ type: 'org_admin' }, {}, '组织管理员'],
    [{ type: 'asset_owner' }, {}, '资产负责人'],
    [{ type: 'role', value: ['system'] }, { system: '系统管理员' }, '系统管理员'],
    [
      { type: 'role', value: ['system', 'custom'] },
      { system: '系统管理员', custom: 'Security review' },
      '系统管理员, Security review'
    ],
    [{ type: 'role', value: ['deleted'] }, {}, '未知'],
    [{ type: 'role', value: ['system'] }, undefined, '角色']
  ]) {
    const app = Vue.createSSRApp({
      render,
      methods: { approverSource: panel.methods.approverSource },
      setup: () => ({
        instance: { approver_role_names: names },
        node: { config: { strategy: 'any', approvers }, required: 1 }
      })
    })
    app.config.globalProperties.$t = (key) => messages[key]
    const html = await renderToString(app)
    assert.equal(
      html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      `${expected} · 或签（一人通过）`
    )
  }
})

const summary = parse(source).descriptor.template.content.match(
  /<div class="workflow-summary">[\s\S]*?<\/div>/
)[0]
const summaryRender = new Function(
  'Vue',
  compile(summary, { mode: 'function', prefixIdentifiers: true }).code
)(Vue)

test('progress shows the bound workflow name and version, including older-backend fallback', async () => {
  for (const [workflowName, fallback, expected] of [
    ['Original workflow', 'Another workflow', 'Original workflow · 版本 1'],
    [undefined, 'Legacy workflow', 'Legacy workflow · 版本 1'],
    [undefined, undefined, '版本 1'],
    [
      '<script>Untrusted name</script>',
      undefined,
      '&lt;script&gt;Untrusted name&lt;/script&gt; · 版本 1'
    ]
  ]) {
    const app = Vue.createSSRApp({
      render: summaryRender,
      components: { ElTag: { render: () => null } },
      setup: () => ({
        object: { workflow: { name: fallback, active_version_number: 7 } },
        instance: { workflow_name: workflowName, version_number: 1, state: 'running' },
        deadlinePassed: false,
        stateTone: () => 'primary',
        stateLabels: { running: 'WFRunning' }
      })
    })
    app.config.globalProperties.$t = (key) => messages[key]
    const html = await renderToString(app)
    assert.equal(
      html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      expected
    )
  }
})
