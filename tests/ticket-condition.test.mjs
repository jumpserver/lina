import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { ElTag } from 'element-plus'
import * as graph from '../src/views/tickets/Workflow/graph.js'

const zh = JSON.parse(await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8'))
const Slot = {
  setup:
    (_, { slots }) =>
    () =>
      Vue.h('div', slots.default?.())
}
async function load(name, bindings) {
  const source = await readFile(
    new URL(`../src/views/tickets/components/${name}.vue`, import.meta.url),
    'utf8'
  )
  const { descriptor } = parse(source)
  const component = new Function(
    ...Object.keys(bindings),
    descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
  )(...Object.values(bindings))
  component.render = new Function(
    'Vue',
    compile(descriptor.template.content, { mode: 'function', prefixIdentifiers: true }).code
  )(Vue)
  return component
}
const Condition = await load('TicketCondition', graph)
const Activity = await load('TicketActivity', {
  ...graph,
  TicketCondition: Condition,
  IBox: Slot,
  CcUsers: Slot,
  TicketAdjustmentDiff: Slot,
  useDateTime: () => ({ toSafeLocalDateStr: (value) => value })
})
async function render(component, props = {}) {
  const app = Vue.createSSRApp(component, props)
  app.config.globalProperties.$t = (key) => zh[key] || key
  for (const name of [
    'el-timeline',
    'el-timeline-item',
    'el-button',
    'el-icon',
    'Refresh',
    'el-collapse',
    'el-collapse-item',
    'el-empty',
    'el-link',
    'el-alert'
  ])
    app.component(name, Slot)
  app.component('el-tag', ElTag)
  app.directive('loading', {})
  return renderToString(app)
}
const rule = (field, operator, value, extra = {}) => ({ field, operator, value, ...extra })
const plain = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

test('known fields and direction values read naturally without changing the saved condition', async () => {
  const condition = Object.freeze(rule('request.direction', 'eq', 'download'))
  const html = await render(Condition, { condition })
  assert.equal(plain(html), '文件传输方向 等于 下载')
  assert.equal(condition.value, 'download')
  assert.equal(
    plain(await render(Condition, { condition: rule('request.duration', 'gte', 3600) })),
    '有效期（秒） 大于等于 3600'
  )
})

test('nested all, any and not groups retain their hierarchy and no invented child outcomes', async () => {
  const condition = {
    and: [
      rule('request.direction', 'eq', 'download'),
      { or: [rule('duration', 'lt', 60), { not: rule('request.ip', 'exists', false) }] }
    ]
  }
  const html = await render(Condition, { condition })
  assert.match(
    plain(html),
    /全部满足 文件传输方向 等于 下载 任一满足 申请时长（秒） 小于 60 不满足 请求 IP 字段不存在/
  )
  assert.equal((html.match(/<ul>/g) || []).length, 3)
  assert.doesNotMatch(html, /el-tag/)
})

test('multiple-resource defaults and explicit quantifiers remain visible', async () => {
  for (const [operator, expected] of [
    ['eq', '任一值满足'],
    ['ne', '所有值满足'],
    ['not_in', '所有值满足']
  ]) {
    const html = await render(Condition, {
      condition: rule('assets.platform.type', operator, operator === 'not_in' ? ['linux'] : 'linux')
    })
    assert.match(plain(html), new RegExp(`资产平台类型.*${expected}`))
  }
  assert.match(
    plain(
      await render(Condition, {
        condition: rule('asset.platform.type', 'ne', 'linux', { quantifier: 'any' })
      })
    ),
    /任一值满足/
  )
  assert.match(
    plain(
      await render(Condition, {
        condition: rule('request.targets.name', 'eq', 'prod'),
        snapshot: { request: { targets: [{ name: 'prod' }] } }
      })
    ),
    /任一值满足/
  )
  assert.doesNotMatch(
    plain(
      await render(Condition, {
        condition: rule('actions', 'contains', 'connect'),
        snapshot: { actions: ['connect'] }
      })
    ),
    /值满足/
  )
})

test('lists, zero, empty text, boolean and unknown fields retain their meaning and are escaped', async () => {
  const list = plain(
    await render(Condition, {
      condition: rule('request.custom', 'in', [0, '0', '', false, 'a,b', 'download']),
      items: [{ name: 'custom', label: '自定义值' }]
    })
  )
  assert.equal(
    list,
    '自定义值 属于列表 [0, &quot;0&quot;, &quot;&quot;, 否, &quot;a,b&quot;, download]'
  )
  const html = await render(Condition, {
    condition: rule('request.unknown', 'eq', '<script>alert(1)</script>')
  })
  assert.match(html, /request.unknown/)
  assert.doesNotMatch(html, /<script>/)
})

test('missing or unrecognized conditions preserve the original record without a misleading translation', async () => {
  assert.equal(plain(await render(Condition)), '-')
  const html = await render(Condition, {
    condition: { field: 'request.custom', operator: 'future_operator', value: 2 }
  })
  assert.match(html, /<pre>/)
  assert.match(html, /future_operator/)
})

test('the result tag uses only the stored boolean and false is neutral', async () => {
  for (const [result, expected, type] of [
    [true, '条件满足', 'primary'],
    [false, '条件不满足', 'info'],
    [undefined, null, null],
    ['false', null, null]
  ]) {
    const component = {
      ...Activity,
      watch: {},
      data: () => ({
        ...Activity.data(),
        events: [
          {
            id: 'condition',
            type: 'condition.evaluated',
            data: { condition: rule('request.direction', 'eq', 'download'), result }
          }
        ]
      })
    }
    const html = await render(component, { object: {} })
    if (expected) {
      assert.match(html, new RegExp(`el-tag--${type}`))
      assert.match(plain(html), new RegExp(expected))
    } else assert.doesNotMatch(html, /el-tag/)
  }
})

test('the new absence wording exists in all supported ticket locales', async () => {
  for (const locale of ['en', 'zh', 'zh_hant']) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/i18n/langs/${locale}.json`, import.meta.url), 'utf8')
    )
    assert.ok(messages.WFOp_not_exists)
  }
})
