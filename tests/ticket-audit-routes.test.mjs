import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(new URL('../src/router/tickets/index.js', import.meta.url), 'utf8')
function routes(permissions) {
  const allowed = (expression) => expression.split('|').some((permission) => permissions.includes(permission.trim()))
  const route = new Function('Layout', 'empty', 'i18n', 'hasPermission',
    source.replace(/^import .*$/gm, '').replace('export default', 'return'))({}, {}, { t: (key) => key }, allowed)
  const visible = (node) => !node.meta?.permissions || node.meta.permissions.every(allowed)
  const walk = (node) => visible(node) ? [node, ...(node.children || []).flatMap(walk)] : []
  return { route, names: walk(route).map((item) => item.name) }
}

test('ticket auditors can open detail drawers without gaining create or workflow routes', () => {
  const { route, names } = routes(['audits.view_ticketaudit'])
  assert.equal(route.redirect().name, 'AuditTicketList')
  for (const name of ['AssetsTicketDetail', 'LoginAssetTicketDetail', 'LoginTicketDetail', 'CommandConfirmDetail', 'TicketDetail']) {
    assert.ok(names.includes(name), name)
  }
  for (const name of ['PluginTicketCreate', 'RequestAssetPermTicketCreateUpdate', 'WorkflowCreate', 'WorkflowDetail']) {
    assert.ok(!names.includes(name), name)
  }
  assert.equal(routes(['tickets.view_ticket']).route.redirect().name, 'MyTicketList')
  assert.equal(routes(['tickets.view_workflow']).route.redirect().name, 'WorkflowList')
  assert.equal(routes([]).names.length, 0)
})
