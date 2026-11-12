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
import _ from 'lodash'
import { toPlainTextMessage } from '../src/utils/common/message.js'

const source = await readFile(
  new URL('../src/views/tickets/Workflow/Designer.vue', import.meta.url),
  'utf8'
)
const commonSource = await readFile(
  new URL('../src/utils/common/index.js', import.meta.url),
  'utf8'
)
const errorSource = commonSource.match(
  /export function getErrorResponseMsg\(error\) \{[\s\S]*?\n\}/
)[0]
const getErrorResponseMsg = new Function(
  '_',
  'i18n',
  'toPlainTextMessage',
  errorSource.replace('export ', '') + '\nreturn getErrorResponseMsg'
)(_, { t: (...args) => i18n.global.t(...args) }, toPlainTextMessage)
const bindings = {
  Page: {},
  IBox: {},
  Select2: {},
  ConditionEditor: {},
  getErrorResponseMsg,
  ...graph
}
const component = new Function(
  ...Object.keys(bindings),
  parse(source)
    .descriptor.script.content.replace(/^import[\s\S]*? from ['"][^'"]+['"]$/gm, '')
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
  for (const [key, computed] of Object.entries(component.computed)) {
    Object.defineProperty(vm, key, {
      get: (typeof computed === 'function' ? computed : computed.get).bind(vm),
      set: computed.set?.bind(vm)
    })
  }
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

test('impossible quorum blocks all writes, selects the node and counts unique users', async () => {
  const user = '27338af8-fcef-46ec-893a-d84171fb13e0'
  for (const value of [[user], [user, user], user]) {
    const vm = mount({ id: 'workflow', active_version: 'version-1' })
    const approval = vm.definition.nodes.find((node) => node.type === 'approval')
    approval.name = 'Security review'
    approval.config = { ...approval.config, approvers: { type: 'user', value }, strategy: 'quorum', required: 2 }
    vm.selectedId = 'start'
    const original = JSON.stringify(vm.definition)
    const calls = []
    vm.$axios = { post: async (...args) => calls.push(args), patch: async (...args) => calls.push(args) }
    await vm.publish()
    assert.deepEqual(calls, [])
    assert.equal(vm.selectedId, approval.id)
    assert.equal(vm.approverValidationNode, approval)
    assert.equal(vm.approverError, '未能发布：「Security review」节点至少选择 2 名审批人，当前已选择 1 名。')
    assert.equal(JSON.stringify(vm.definition), original)
    assert.equal(vm.workflow.active_version, 'version-1')
    approval.config.approvers.value = [user, '63a39ac1-165f-4ef1-b0fa-0b32e96386aa']
    assert.equal(vm.approverError, '')
    approval.config.approvers.value = [user]
    assert.notEqual(vm.approverError, '')
    approval.config.required = 1
    assert.equal(vm.approverError, '')
    approval.config.required = 2
    vm.changeStrategy('all')
    assert.equal(vm.approverError, '')
  }
})

test('quorum validation keeps dynamic approver sources available', () => {
  const vm = mount()
  const approval = vm.definition.nodes.find((node) => node.type === 'approval')
  approval.config.strategy = 'quorum'
  approval.config.required = 2
  for (const type of ['user_group', 'role', 'org_admin', 'asset_owner']) {
    approval.config.approvers = ['user_group', 'role'].includes(type) ? { type, value: ['resource'] } : { type }
    assert.equal(vm.getApproverError(approval), '')
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
  for (const type of ['asset_owner', 'org_admin']) {
    second.config.approvers = { type }
    assert.equal(vm.missingApprovers(second), false)
  }
  second.config.approvers = { type: 'role' }
  assert.equal(vm.missingApprovers(second), true)
  second.config.approvers.value = '27338af8-fcef-46ec-893a-d84171fb13e0'
  assert.equal(vm.missingApprovers(second), false)
})

test('a corrected quorum can be published through the normal flow', async () => {
  const vm = mount({ id: 'workflow', enabled: false })
  const approval = vm.definition.nodes.find((node) => node.type === 'approval')
  approval.config.strategy = 'quorum'
  approval.config.required = 2
  approval.config.approvers = { type: 'user', value: ['27338af8-fcef-46ec-893a-d84171fb13e0'] }
  await vm.publish()
  approval.config.approvers.value = ['27338af8-fcef-46ec-893a-d84171fb13e0', '63a39ac1-165f-4ef1-b0fa-0b32e96386aa']
  const calls = []
  vm.$route = { name: 'WorkflowDetail' }
  vm.$message = { success: () => {} }
  vm.$axios = {
    patch: async (url, data) => {
      calls.push({ url, data })
      return { ...vm.workflow, ...data }
    },
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
    ['27338af8-fcef-46ec-893a-d84171fb13e0', '63a39ac1-165f-4ef1-b0fa-0b32e96386aa']
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

test('publishing an inherited workflow uses the local copy and its version, including after a failed publish', async () => {
  const vm = mount({
    id: 'global',
    active_version: 'global-v4',
    active_version_number: 4,
    enabled: true
  })
  vm.$route = { name: 'WorkflowDetail', params: { id: 'global' } }
  const routes = []
  const calls = []
  vm.$router = { replace: async (route) => routes.push(route) }
  vm.$message = { success: () => {} }
  let fail = true
  vm.$axios = {
    patch: async (url, data) => {
      calls.push({ url, data })
      return {
        ...vm.workflow,
        ...data,
        id: 'local',
        active_version: 'local-v1',
        active_version_number: 1
      }
    },
    get: async (url) => {
      assert.equal(url, '/api/v1/tickets/workflows/local/versions/')
      return { results: [{ id: 'local-v1', number: 1 }], next: null }
    },
    post: async (url, data) => {
      calls.push({ url, data })
      assert.equal(url, '/api/v1/tickets/workflows/local/publish/')
      assert.equal(data.expected_version, 1)
      if (fail) throw new Error('Temporary failure')
      return { id: 'local-v2', number: 2 }
    }
  }
  await vm.publish()
  assert.ok(vm.error.includes('Temporary failure'))
  assert.equal(vm.workflow.id, 'local')
  assert.equal(routes.length, 0)
  fail = false
  await vm.publish()
  assert.equal(vm.error, '')
  assert.equal(calls[0].url, '/api/v1/tickets/workflows/global/')
  assert.equal(calls[0].data.expected_version, 4)
  assert.equal(calls[2].url, '/api/v1/tickets/workflows/local/')
  assert.equal(calls[2].data.expected_version, 1)
  assert.deepEqual(
    vm.versions.map(({ id }) => id),
    ['local-v2', 'local-v1']
  )
  assert.deepEqual(routes, [{ name: 'WorkflowDetail', params: { id: 'local' } }])
})

test('disabling an inherited workflow switches to the local copy without losing unsaved metadata', async () => {
  const vm = mount({
    id: 'global',
    active_version: 'global-v4',
    active_version_number: 4,
    enabled: true
  })
  vm.workflow.comment = 'Unsaved comment'
  const routes = []
  vm.$router = { replace: async (route) => routes.push(route) }
  vm.$axios = {
    patch: async (url, data) => {
      assert.equal(url, '/api/v1/tickets/workflows/global/')
      assert.deepEqual(data, { enabled: false, expected_version: 4 })
      return {
        ...vm.workflow,
        comment: 'Saved comment',
        id: 'local',
        enabled: false,
        active_version: 'local-v1',
        active_version_number: 1
      }
    },
    get: async (url) => {
      assert.equal(url, '/api/v1/tickets/workflows/local/versions/')
      return { results: [{ id: 'local-v1', number: 1 }], next: null }
    }
  }
  await vm.toggleEnabled()
  assert.equal(vm.workflow.id, 'local')
  assert.equal(vm.workflow.enabled, false)
  assert.equal(vm.workflow.comment, 'Unsaved comment')
  assert.equal(vm.selectedVersion, 'local-v1')
  assert.equal(vm.dirty, true)
  assert.deepEqual(routes, [{ name: 'WorkflowDetail', params: { id: 'local' } }])
})

test('a failed publish does not silently advance the expected version for an existing workflow', async () => {
  const vm = mount({ id: 'local', active_version: 'local-v2', active_version_number: 2 })
  vm.$axios = {
    patch: async () => ({ ...vm.workflow, active_version: 'local-v3', active_version_number: 3 }),
    post: async (url, data) => {
      assert.equal(data.expected_version, 2)
      throw { response: { status: 409 } }
    }
  }
  await vm.publish()
  await vm.publish()
  assert.equal(vm.workflow.active_version_number, 2)
  assert.equal(vm.error, i18n.global.t('WFConflict'))
})

test('publish errors show readable messages while preserving the unpublished definition', async () => {
  const message = '审批流程必须包含 2 至 128 个节点。'
  for (const [error, expected] of [
    [{ response: { status: 400, data: { definition: [message] } } }, message],
    [{ response: { status: 400, data: { detail: message } } }, message],
    [new Error('Network Error'), 'Error: Network Error'],
    [{ response: { status: 400, data: {} }, message: 'Publish failed' }, 'Publish failed']
  ]) {
    const vm = mount({ id: 'workflow', active_version: 'version-1', active_version_number: 1 })
    vm.definition.nodes[0].name = 'Unsaved start'
    const definition = structuredClone(vm.definition)
    vm.$axios = {
      patch: async () => vm.workflow,
      post: async () => {
        throw error
      }
    }
    await vm.publish()
    assert.equal(vm.error, expected)
    assert.equal(vm.saving, false)
    assert.equal(vm.workflow.active_version, 'version-1')
    assert.equal(vm.dirty, true)
    assert.deepEqual(vm.definition, definition)
  }
})

test('asset owner guidance is localized and only shown for asset owner approvals', async () => {
  const template = parse(source).descriptor.template.content.match(
    /<p v-if="selected.config.approvers.type === 'asset_owner'"[\s\S]*?<\/p>/
  )[0]
  const render = new Function(
    'Vue',
    compile(template, { mode: 'function', prefixIdentifiers: true }).code
  )(Vue)
  assert.ok(!mount().resolvers.includes('applicant_manager'))
  for (const locale of ['zh', 'zh_hant', 'en']) {
    for (const type of ['asset_owner', 'user', 'org_admin']) {
      const app = Vue.createSSRApp({
        render,
        setup: () => ({ selected: { config: { approvers: { type } } } })
      })
      app.config.globalProperties.$t = (key) => messages[locale][key]
      const html = await renderToString(app)
      assert.ok(messages[locale].WFAssetOwnerHelp)
      assert.equal(html.includes(messages[locale].WFAssetOwnerHelp), type === 'asset_owner')
    }
  }
})

test('timeout input uses whole minutes while workflow definitions keep seconds', () => {
  const vm = mount()
  assert.equal(vm.timeoutMinutes, 1440)
  for (const minutes of [0, 1, 30, 525600]) {
    vm.timeoutMinutes = minutes
    assert.equal(vm.selected.config.timeout, minutes * 60)
    assert.equal(vm.timeoutMinutes, minutes)
  }
  vm.timeoutMinutes = null
  assert.equal(vm.selected.config.timeout, 0)
})

test('leaving a dirty workflow keeps the confirmation open across hash changes', async () => {
  for (const action of ['confirm', 'cancel', 'close']) {
    const vm = mount()
    vm.renameWorkflow('Unsaved workflow')
    let options
    let finish
    vm.$confirm = (message, title, suppliedOptions) => {
      options = suppliedOptions
      return new Promise((resolve, reject) => {
        finish = () => (action === 'confirm' ? resolve(action) : reject(action))
      })
    }
    let settled = false
    const navigation = component.beforeRouteLeave.call(vm).then((result) => {
      settled = true
      return result
    })
    await Promise.resolve()
    assert.equal(settled, false)
    assert.equal(options?.closeOnHashChange, false)
    finish()
    assert.equal(await navigation, action === 'confirm')
    assert.equal(vm.workflow.name, 'Unsaved workflow')
    assert.equal(vm.dirty, true)
  }
})

test('unchanged workflows and publication navigation do not prompt before leaving', async () => {
  const vm = mount()
  let prompts = 0
  vm.$confirm = async () => {
    prompts += 1
  }
  assert.equal(await component.beforeRouteLeave.call(vm), true)
  vm.renameWorkflow('Publishing workflow')
  vm.saving = true
  assert.equal(await component.beforeRouteLeave.call(vm), true)
  assert.equal(prompts, 0)
})

test('reopening Create starts clean after discarding unpublished and published drafts', async () => {
  for (const workflow of [
    {},
    { id: 'unpublished-draft' },
    { id: 'published-workflow', active_version: 'version-1' }
  ]) {
    const vm = mount(workflow)
    vm.$route = { name: 'WorkflowCreate', params: {} }
    let prompts = 0
    vm.$confirm = async () => {
      prompts += 1
    }
    vm.renameWorkflow('Discard this draft')
    vm.workflow.type = 'change_secret'
    vm.workflow.comment = 'Discard this comment'
    vm.selected.config.approvers = { type: 'user', value: ['reviewer'] }
    vm.selected.config.strategy = 'quorum'
    vm.selected.config.required = 2
    vm.insert(vm.outgoing[0], 'approval')
    vm.advancedOpen = ['advanced']
    vm.error = 'Previous error'
    vm.approverValidationId = vm.selectedId
    vm.ticketTypes = [{ type: 'apply_asset' }]
    const defaults = component.data()

    assert.equal(vm.dirty, true)
    assert.equal(await component.beforeRouteLeave.call(vm), true)
    component.activated.call(vm)

    assert.deepEqual(vm.workflow, defaults.workflow)
    assert.deepEqual(vm.definition, defaults.definition)
    assert.equal(vm.selectedId, defaults.selectedId)
    assert.deepEqual(vm.advancedOpen, [])
    assert.equal(vm.error, '')
    assert.equal(vm.approverValidationId, null)
    assert.equal(vm.dirty, false)
    assert.equal(vm.selectedVersion, null)
    assert.deepEqual(vm.versions, [])
    assert.deepEqual(vm.ticketTypes, [{ type: 'apply_asset' }])
    assert.equal(await component.beforeRouteLeave.call(vm), true)
    assert.equal(prompts, 1)
  }
})

test('choosing login confirmation replaces only organization-admin defaults', () => {
  const vm = mount()
  const approval = vm.definition.nodes.find(node => node.type === 'approval')
  approval.config.strategy = 'all'
  approval.config.timeout = 600
  const explicit = structuredClone(approval)
  explicit.id = 'explicit'
  explicit.config.approvers = { type: 'user', value: ['reviewer'] }
  vm.definition.nodes.push(explicit)
  vm.workflow.type = 'login_confirm'
  vm.changeTicketType('login_confirm')
  assert.deepEqual(approval.config.approvers, { type: 'role', value: ['00000000-0000-0000-0000-000000000001'] })
  assert.equal(approval.config.strategy, 'all')
  assert.equal(approval.config.timeout, 600)
  assert.equal(approval.config.exclude_applicant, true)
  assert.deepEqual(explicit.config.approvers, { type: 'user', value: ['reviewer'] })
  vm.insert(vm.definition.edges[0], 'condition')
  assert.ok(vm.definition.nodes.filter(node => node.type === 'approval').every(node => node.config.approvers.type !== 'org_admin'))
})

test('an existing login workflow keeps its approvers and blocks republishing an organization-admin node', async () => {
  const vm = mount({ id: 'workflow', type: 'login_confirm', active_version: 'version-1' })
  const definition = graph.newDefinition()
  const approval = definition.nodes.find(node => node.type === 'approval')
  approval.name = 'Login review'
  vm.versions = [{ id: 'version-1', definition }]
  await vm.selectVersion('version-1')
  assert.equal(vm.definition.nodes.find(node => node.id === approval.id).config.approvers.type, 'org_admin')
  let focused = false
  vm.$refs.approverSourceField = { $el: { scrollIntoView() {}, querySelector: () => ({ focus: () => { focused = true } }) } }
  const calls = []
  vm.$axios = { post: async (...args) => calls.push(args), patch: async (...args) => calls.push(args) }
  await vm.publish()
  assert.deepEqual(calls, [])
  assert.equal(vm.selectedId, approval.id)
  assert.equal(focused, true)
  assert.match(vm.approverError, /Login review.*不能使用组织管理员/)
  vm.workflow.type = 'apply_asset'
  assert.equal(vm.approverError, '')
  vm.workflow.type = 'login_confirm'
  vm.selected.config.approvers = { type: 'role', value: ['00000000-0000-0000-0000-000000000001'] }
  assert.equal(vm.approverError, '')
})


test('login confirmation hides asset owners and replaces that source when switching business type', () => {
  const vm = mount()
  for (const type of ['apply_asset', 'login_asset_confirm']) {
    vm.workflow.type = type
    assert.ok(vm.resolvers.includes('asset_owner'))
  }
  const approval = vm.selected
  approval.config.approvers = { type: 'asset_owner' }
  approval.config.strategy = 'all'
  approval.config.timeout = 600
  vm.workflow.type = 'login_confirm'
  vm.changeTicketType('login_confirm')
  assert.deepEqual(vm.resolvers, ['user', 'user_group', 'role', 'org_admin'])
  assert.deepEqual(approval.config.approvers, { type: 'role', value: ['00000000-0000-0000-0000-000000000001'] })
  assert.equal(approval.config.strategy, 'all')
  assert.equal(approval.config.timeout, 600)
  assert.equal(approval.config.exclude_applicant, true)
})

test('an existing login asset-owner node stays visible and cannot be republished', async () => {
  const vm = mount({ id: 'workflow', type: 'login_confirm', active_version: 'version-1' })
  const definition = graph.newDefinition()
  const approval = definition.nodes.find(node => node.type === 'approval')
  approval.name = 'Login review'
  approval.config.approvers = { type: 'asset_owner' }
  vm.versions = [{ id: 'version-1', definition }]
  await vm.selectVersion('version-1')
  assert.equal(vm.definition.nodes.find(node => node.id === approval.id).config.approvers.type, 'asset_owner')
  assert.ok(!vm.resolvers.includes('asset_owner'))
  const calls = []
  vm.$axios = { post: async (...args) => calls.push(args), patch: async (...args) => calls.push(args) }
  await vm.publish()
  assert.deepEqual(calls, [])
  assert.match(vm.approverError, /Login review.*不能使用资产负责人/)
  vm.workflow.type = 'login_asset_confirm'
  assert.equal(vm.approverError, '')
})
