import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/settings/Task/TaskLogWindow.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const browser = { location: { origin: 'https://jumpserver.example' } }
const component = new Function(
  'window',
  descriptor.script.content.replace('export default', 'return')
)(browser)
const taskUrl = (id, type = 'celery') => `/core/ops/${type}/task/${id}/log/?type=${type}`

function logWindow() {
  const context = { ...component.data(), $t: (key) => key }
  for (const [key, method] of Object.entries(component.methods)) context[key] = method.bind(context)
  return context
}

test('different tasks get separate tabs; reopening preserves the existing tab', () => {
  const view = logWindow()
  view.openTab(taskUrl('first'))
  const first = view.tabs[0]
  view.openTab(taskUrl('second'))
  assert.equal(view.tabs.length, 2)
  view.openTab(browser.location.origin + taskUrl('first'))
  assert.equal(view.tabs.length, 2)
  assert.equal(view.tabs[0], first)
  assert.equal(view.activeTab, first.url)
})

test('missing default type and explicit type identify the same task', () => {
  const view = logWindow()
  view.openTab('/core/ops/celery/task/first/log/')
  view.openTab(taskUrl('first'))
  assert.equal(view.tabs.length, 1)
  view.openTab(taskUrl('first', 'ansible'))
  assert.equal(view.tabs.length, 2)
})

test('closing active and inactive tabs selects a surviving neighbor and allows reopening', () => {
  const view = logWindow()
  for (const id of ['first', 'second', 'third']) view.openTab(taskUrl(id))
  const [first, second, third] = view.tabs
  view.closeTab(first.url)
  assert.equal(view.activeTab, third.url)
  view.closeTab(third.url)
  assert.equal(view.activeTab, second.url)
  view.closeTab(second.url)
  assert.equal(view.activeTab, '')
  assert.equal(view.tabs.length, 0)
  view.openTab(taskUrl('second'))
  assert.equal(view.tabs.length, 1)
  assert.equal(view.activeTab, second.url)
})

test('custom activity URLs retain their parameters and unsafe URLs are ignored', () => {
  const view = logWindow()
  view.openTab('/core/ops/custom-log/?execution=first&mode=full')
  assert.equal(new URL(view.tabs[0].url).searchParams.get('execution'), 'first')
  for (const url of [
    undefined,
    [],
    '',
    'http://[invalid',
    'javascript:alert(1)',
    'https://other.example/log/'
  ]) {
    view.openTab(url)
  }
  assert.equal(view.tabs.length, 1)
})

const openerSource = await readFile(new URL('../src/utils/jms/index.js', import.meta.url), 'utf8')
function taskOpener(popup) {
  const calls = []
  const routes = []
  const window = {
    screen: { height: 1080, width: 1920 },
    open: (...args) => {
      calls.push(args)
      return popup
    }
  }
  const getRouter = () => ({
    resolve: (route) => {
      routes.push(route)
      return { href: '/ui/#/ops/task/logs/?' + new URLSearchParams(route.query) }
    }
  })
  const code = openerSource.slice(
    openerSource.indexOf('let taskWindowRequest'),
    openerSource.indexOf('export function getResourceFromApiUrl')
  )
  const open = new Function(
    'window',
    'getRouter',
    code.replace('export function openTaskPage', 'function openTaskPage') + '\nreturn openTaskPage'
  )(window, getRouter)
  return { open, calls, routes }
}

test('all log opens reuse a named window with distinct hash navigations and focus it', () => {
  let focused = 0
  const { open, calls, routes } = taskOpener({ focus: () => focused++ })
  open('first')
  open('second')
  open('first')
  assert.equal(new Set(calls.map((call) => call[1])).size, 1)
  assert.notEqual(calls[0][1], '_blank')
  assert.equal(new Set(calls.map((call) => call[0])).size, 3)
  assert.equal(routes[0].query.url, taskUrl('first'))
  assert.equal(focused, 3)
})

test('blocked popups do not throw and custom log URLs remain intact', () => {
  const { open, routes } = taskOpener(null)
  assert.doesNotThrow(() => open('', 'celery', '/core/ops/custom-log/?id=123'))
  assert.equal(routes[0].query.url, '/core/ops/custom-log/?id=123')
})
