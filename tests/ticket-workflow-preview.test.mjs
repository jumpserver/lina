import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { stateLabels, nodeLabels } from '../src/views/tickets/Workflow/graph.js'

const source = await readFile(
  new URL('../src/views/tickets/components/WorkflowPanel.vue', import.meta.url),
  'utf8'
)
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
const messages = JSON.parse(
  await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
)
const node = (key, state, extra = {}) => ({
  id: key,
  key,
  name: key,
  type: 'approval',
  state,
  config: { approvers: { type: 'org_admin' }, strategy: 'any' },
  ...extra
})
const timeline = (instance) => panel.computed.timelineNodes.call({ instance })
const skipped = (instance) => panel.computed.skippedNodes.call({ instance })

test('pending levels and end follow actual runs without inventing tasks or timestamps', () => {
  const instance = {
    nodes: [node('first', 'running', { tasks: [{ id: 'task', state: 'pending' }] })],
    upcoming_nodes: [node('second', 'not_started'), node('end', 'not_started', { type: 'end' })]
  }
  const result = timeline(instance)
  assert.deepEqual(
    result.map((n) => n.key),
    ['first', 'second', 'end']
  )
  assert.equal(result[0].pendingTasks.length, 1)
  assert.deepEqual(result[1].pendingTasks, [])
  assert.deepEqual(result[1].historyTasks, [])
  assert.equal(result[1].date_created, undefined)
  assert.equal(result[1].deadline, undefined)
  assert.equal(panel.computed.currentNode.call({ instance }).key, 'first')
  instance.nodes.push(node('second', 'running'))
  instance.nodes[0].state = 'approved'
  instance.upcoming_nodes.shift()
  assert.deepEqual(
    timeline(instance).map((n) => n.key),
    ['first', 'second', 'end']
  )
})

test('unknown branches stay visible and bypassed branches use the existing skipped section', () => {
  const instance = {
    nodes: [node('first', 'running')],
    upcoming_nodes: [node('yes', 'branch_pending'), node('no', 'branch_pending')]
  }
  assert.equal(timeline(instance).length, 3)
  assert.deepEqual(skipped(instance), [])
  instance.upcoming_nodes[1].state = 'skipped'
  assert.deepEqual(
    timeline(instance).map((n) => n.key),
    ['first', 'yes']
  )
  assert.deepEqual(
    skipped(instance).map((n) => n.key),
    ['no']
  )
  instance.nodes.push(node('historical-skip', 'skipped'))
  assert.deepEqual(
    skipped(instance).map((n) => n.key),
    ['historical-skip', 'no']
  )
})

test('completed flows and older APIs retain their existing timeline', () => {
  const instance = {
    date_finished: '2026-11-11',
    nodes: [node('first', 'approved'), node('end', 'approved', { type: 'end' })]
  }
  assert.deepEqual(
    timeline(instance).map((n) => n.key),
    ['first']
  )
  assert.deepEqual(skipped(instance), [])
  assert.deepEqual(timeline(null), [])
})

const render = new Function(
  'Vue',
  compile(source.match(/<el-timeline class="approval-timeline"[\s\S]*?<\/el-timeline>/)[0], {
    mode: 'function',
    prefixIdentifiers: true
  }).code
)(Vue)
const wrapper = {
  render() {
    return Vue.h('div', [this.$slots.dot?.(), this.$slots.default?.()])
  }
}
const icon = { render: () => null }

test('future nodes render their source and distinct state without approval tasks or deadlines', async () => {
  const instance = {
    state: 'running',
    nodes: [],
    upcoming_nodes: [
      node('后续组织审批', 'not_started'),
      node('条件节点', 'not_started', { type: 'condition', config: {} }),
      node('分支角色审批', 'branch_pending', {
        config: { approvers: { type: 'role', value: ['role'] }, strategy: 'quorum' },
        required: 2
      }),
      node('结束', 'not_started', { type: 'end', config: {} })
    ],
    approver_role_names: { role: '系统管理员' }
  }
  const app = Vue.createSSRApp({
    render,
    components: {
      ElTimeline: wrapper,
      ElTimelineItem: wrapper,
      ElTag: wrapper,
      ElIcon: wrapper,
      VideoPlay: icon,
      Promotion: icon,
      Share: icon,
      User: icon,
      Finished: icon,
      Clock: icon
    },
    setup: () => ({
      instance,
      timelineNodes: timeline(instance),
      currentNode: null,
      stateLabels,
      nodeLabels,
      deadlinePassed: false
    }),
    methods: { approverSource: panel.methods.approverSource, stateTone: panel.methods.stateTone }
  })
  app.config.globalProperties.$t = (key, params) => messages[key]?.replace('{count}', params?.count)
  const html = await renderToString(app)
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ')
  assert.match(text, /后续组织审批.*未开始.*组织管理员.*或签/)
  assert.match(text, /条件节点.*未开始/)
  assert.match(text, /分支角色审批.*分支待确定.*系统管理员.*需 2 人通过/)
  assert.match(text, /结束.*未开始/)
  assert.doesNotMatch(html, /step-deadline|pending-reviewers|<time/)
})
