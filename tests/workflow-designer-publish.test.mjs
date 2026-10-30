import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { createI18n } from 'vue-i18n'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { ElFormItem, ID_INJECTION_KEY } from 'element-plus'
import * as graph from '../src/views/tickets/Workflow/graph.js'

const source = await readFile(
  new URL('../src/views/tickets/Workflow/Designer.vue', import.meta.url),
  'utf8'
)
const bindings = { Page: {}, IBox: {}, Select2: {}, ConditionEditor: {}, ...graph }
const component = new Function(
  ...Object.keys(bindings),
  parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
)(...Object.values(bindings))
const messages = Object.fromEntries(
  await Promise.all(
    ['zh', 'zh_hant', 'en'].map(async (locale) => [
      locale,
      JSON.parse(
        await readFile(new URL(`../src/i18n/langs/${locale}.json`, import.meta.url), 'utf8')
      )
    ])
  )
)
const i18n = createI18n({ legacy: false, locale: 'zh', messages })

function mount(workflow = {}) {
  const vm = {
    ...component.data(),
    $t: i18n.global.t,
    $hasPerm: () => true,
    $nextTick: async () => {},
    $refs: {}
  }
  vm.workflow = { ...vm.workflow, name: 'Approval', ...workflow }
  for (const [key, method] of Object.entries(component.methods)) vm[key] = method.bind(vm)
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(vm, key, { get: getter.bind(vm) })
  vm.captureBaseline()
  return vm
}

test('generated node labels are translated without changing the definition being published', () => {
  const vm = mount()
  const node = { id: 'approval_1', type: 'approval', name: 'Approval 1' }
  vm.versions = [
    {
      id: 'version-1',
      definition: { nodes: [{ ...node }] },
      node_names: { approval_1: '第 1 级审批' }
    }
  ]
  vm.selectedVersion = 'version-1'
  assert.equal(vm.nodeName(node), '第 1 级审批')
  assert.equal(node.name, 'Approval 1')
  node.name = 'Operations approval'
  assert.equal(vm.nodeName(node), 'Operations approval')
})

test('enable is primary only for an unchanged, disabled current published version', () => {
  const vm = mount()
  assert.equal(vm.enablePrimary, false)
  vm.workflow.active_version = 'version-1'
  vm.selectedVersion = 'version-1'
  assert.equal(vm.enablePrimary, true)
  vm.workflow.comment = 'Unsaved edit'
  assert.equal(vm.enablePrimary, false)
  vm.captureBaseline()
  vm.definition.nodes[0].name = 'Unsaved node'
  assert.equal(vm.enablePrimary, false)
  vm.captureBaseline()
  vm.selectedVersion = 'older-version'
  assert.equal(vm.enablePrimary, false)
  vm.selectedVersion = 'version-1'
  vm.workflow.enabled = true
  assert.equal(vm.enablePrimary, false)
  vm.workflow.enabled = false
  vm.loading = true
  assert.equal(vm.enablePrimary, false)
})

test('publishing reports the resulting version and enablement without enabling it', async () => {
  for (const [isNew, enabled] of [
    [true, false],
    [false, false],
    [false, true]
  ]) {
    const vm = mount(
      isNew
        ? {}
        : { id: 'workflow', active_version: 'version-2', active_version_number: 2, enabled }
    )
    const calls = []
    const notices = []
    const routes = []
    vm.$route = { name: isNew ? 'WorkflowCreate' : 'WorkflowDetail' }
    vm.$router = { replace: async (route) => routes.push(route) }
    vm.$message = { success: (message) => notices.push(message) }
    vm.$axios = {
      patch: async (url, data) => {
        calls.push({ url, data })
        return { ...vm.workflow, ...data }
      },
      post: async (url, data) => {
        calls.push({ url, data })
        return url.endsWith('/publish/')
          ? { id: 'version-3', number: 3 }
          : { ...data, id: 'workflow', enabled: false }
      }
    }
    await vm.publish()
    assert.equal(vm.error, '')
    assert.equal(vm.saving, false)
    assert.equal(vm.dirty, false)
    assert.equal(vm.workflow.enabled, enabled)
    assert.equal(vm.selectedVersion, 'version-3')
    assert.equal(vm.enablePrimary, !enabled)
    assert.deepEqual(notices, [
      enabled ? '版本 3 已发布，新申请将使用此版本。' : '版本 3 已发布，启用后可用于新申请。'
    ])
    assert.equal(calls.length, 2)
    assert.ok(calls.every(({ data }) => !Object.hasOwn(data, 'enabled')))
    assert.equal(calls[1].data.expected_version, isNew ? 0 : 2)
    assert.equal(routes.length, isNew ? 1 : 0)
  }
})

test('publication guidance includes the actual version in each supported language', () => {
  for (const locale of ['zh', 'zh_hant', 'en']) {
    for (const key of ['WFPublished', 'WFPublishedDisabledHelp']) {
      const message = i18n.global.t(key, { number: 7 }, { locale })
      assert.ok(message.includes('7'))
      assert.ok(!message.includes('{number}'))
      assert.notEqual(message, key)
    }
    for (const key of ['WFPublishedDisabled', 'WFEnableFlow']) {
      assert.ok(messages[locale][key])
    }
  }
})

test('missing explicit approvers blocks all writes and focuses the node without losing edits', async () => {
  for (const type of ['user', 'user_group', 'role']) {
    const vm = mount({ id: 'workflow', comment: 'Keep my comment', active_version: 'version-1' })
    const approval = vm.definition.nodes.find((node) => node.type === 'approval')
    approval.name = 'Security review'
    approval.config.approvers = { type, value: [] }
    vm.selectedId = 'start'
    const definition = JSON.stringify(vm.definition)
    const calls = []
    let focused = false
    let scrolled = false
    vm.$axios = {
      post: async (...args) => calls.push(args),
      patch: async (...args) => calls.push(args)
    }
    vm.$refs.approverField = {
      $el: {
        scrollIntoView: () => {
          scrolled = true
        },
        querySelector: () => ({
          focus: () => {
            focused = true
          }
        })
      }
    }
    await vm.publish()
    assert.deepEqual(calls, [])
    assert.equal(vm.saving, false)
    assert.equal(vm.selectedId, approval.id)
    assert.equal(vm.approverValidationNode, approval)
    assert.match(vm.approverError, /Security review/)
    assert.equal(focused, true)
    assert.equal(scrolled, true)
    assert.equal(JSON.stringify(vm.definition), definition)
    assert.equal(vm.workflow.comment, 'Keep my comment')
    assert.equal(vm.workflow.active_version, 'version-1')
    approval.config.approvers.value = ['27338af8-fcef-46ec-893a-d84171fb13e0']
    assert.equal(vm.approverError, '')
    assert.equal(vm.approverValidationNode, undefined)
  }
})

test('validation advances to the next empty approval and clears after changing resolver', async () => {
  const vm = mount()
  const first = vm.definition.nodes.find((node) => node.type === 'approval')
  first.config.approvers = { type: 'user', value: [] }
  const second = structuredClone(first)
  second.id = 'approval_2'
  second.name = 'Second approval'
  vm.definition.nodes.push(second)
  await vm.publish()
  assert.equal(vm.selectedId, first.id)
  first.config.approvers.value = ['27338af8-fcef-46ec-893a-d84171fb13e0']
  await vm.publish()
  assert.equal(vm.selectedId, second.id)
  vm.changeResolver('org_admin')
  assert.equal(vm.approverError, '')
  assert.equal(vm.definition.nodes.find(vm.missingApprovers), undefined)
  for (const type of ['applicant_manager', 'asset_owner', 'org_admin']) {
    second.config.approvers = { type }
    assert.equal(vm.missingApprovers(second), false)
  }
  second.config.approvers = { type: 'role' }
  assert.equal(vm.missingApprovers(second), true)
  second.config.approvers.value = '27338af8-fcef-46ec-893a-d84171fb13e0'
  assert.equal(vm.missingApprovers(second), false)
})

test('a corrected approval can be published through the normal flow', async () => {
  const vm = mount({ id: 'workflow', enabled: false })
  const approval = vm.definition.nodes.find((node) => node.type === 'approval')
  approval.config.approvers = { type: 'user', value: [] }
  await vm.publish()
  approval.config.approvers.value = ['27338af8-fcef-46ec-893a-d84171fb13e0']
  const calls = []
  vm.$route = { name: 'WorkflowDetail' }
  vm.$message = { success: () => {} }
  vm.$axios = {
    patch: async (url, data) => calls.push({ url, data }),
    post: async (url, data) => {
      calls.push({ url, data })
      return { id: 'version-1', number: 1 }
    }
  }
  await vm.publish()
  assert.equal(calls.length, 2)
  assert.equal(vm.error, '')
  assert.equal(vm.approverError, '')
  assert.equal(vm.approverValidationId, null)
  assert.equal(vm.workflow.active_version, 'version-1')
  assert.deepEqual(
    calls[1].data.definition.nodes.find((node) => node.type === 'approval').config.approvers.value,
    ['27338af8-fcef-46ec-893a-d84171fb13e0']
  )
})

test('approver guidance names the node and selected source in each language', () => {
  for (const locale of ['zh', 'zh_hant', 'en']) {
    for (const type of ['user', 'user_group', 'role']) {
      const key = `WFApproversRequired_${type}`
      const message = i18n.global.t(key, { node: 'Security review' }, { locale })
      assert.ok(message.includes('Security review'))
      assert.notEqual(message, key)
      assert.ok(messages[locale][`WFApproversPlaceholder_${type}`])
    }
  }
})

test('the approver field is red when first mounted after jumping from another node', async () => {
  const template = parse(source).descriptor.template.content.match(
    /<el-form-item\s+v-if="resourceResolver"[\s\S]*?<\/el-form-item>/
  )[0]
  const render = new Function(
    'Vue',
    compile(template, { mode: 'function', prefixIdentifiers: true }).code
  )(Vue)
  const vm = mount()
  const approval = vm.definition.nodes.find((node) => node.type === 'approval')
  approval.config.approvers = { type: 'user', value: [] }
  vm.selectedId = 'start'
  await vm.publish()
  for (const corrected of [false, true]) {
    if (corrected) approval.config.approvers.value = ['27338af8-fcef-46ec-893a-d84171fb13e0']
    const app = Vue.createSSRApp({
      render,
      components: { ElFormItem, Select2: { render: () => Vue.h('input') } },
      setup: () => ({
        resourceResolver: vm.resourceResolver,
        selected: vm.selected,
        approverValidationNode: vm.approverValidationNode,
        approverError: vm.approverError,
        approverAjax: vm.approverAjax
      })
    })
    app.config.globalProperties.$t = vm.$t
    app.provide(ID_INJECTION_KEY, { prefix: 1, current: 0 })
    const html = await renderToString(app)
    assert.equal(html.includes('is-error'), !corrected)
    assert.ok(html.includes('is-required'))
    assert.ok(!html.includes('el-form-item__error'))
  }
})
