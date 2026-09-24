import test from 'node:test'
import assert from 'node:assert/strict'
import { newDefinition, insertNode, removeNode, layoutGraph } from '../src/views/tickets/Workflow/graph.js'

function paths(graph, id = 'start', seen = []) {
  assert.ok(!seen.includes(id), 'workflow must remain acyclic')
  const edges = graph.edges.filter(e => e.source === id)
  if (!edges.length) { assert.equal(id, 'end'); return [[id]] }
  return edges.flatMap(e => paths(graph, e.target, [...seen, id]).map(path => [id, ...path]))
}
test('inserting a condition preserves two complete exclusive paths', () => {
  const graph = newDefinition()
  const node = insertNode(graph, graph.edges[0], 'condition', 'Production?')
  const branches = graph.edges.filter(e => e.source === node.id)
  assert.deepEqual(branches.map(e => e.condition).sort(), [false, true])
  const routes = paths(graph)
  assert.equal(routes.length, 2)
  assert.ok(routes.every(path => path.includes('approval_1')))
  assert.equal(new Set(layoutGraph(graph).map(n => `${n.x},${n.y}`)).size, graph.nodes.length)
})
test('additional approval levels remain ordered and can be removed', () => {
  const graph = newDefinition()
  const inserted = insertNode(graph, graph.edges[0], 'approval', 'Security')
  assert.deepEqual(paths(graph), [['start', inserted.id, 'approval_1', 'end']])
  assert.equal(removeNode(graph, inserted.id), true)
  assert.deepEqual(paths(graph), [['start', 'approval_1', 'end']])
})
test('CC can be placed after an approval and removed without changing the path', () => {
  const graph = newDefinition()
  const inserted = insertNode(graph, graph.edges[1], 'cc', 'Notify security')
  assert.deepEqual(inserted.config, { users: [] })
  assert.deepEqual(paths(graph), [['start', 'approval_1', inserted.id, 'end']])
  assert.equal(removeNode(graph, inserted.id), true)
  assert.deepEqual(paths(graph), [['start', 'approval_1', 'end']])
})
test('removing the only branch approval cannot collapse both condition outputs', () => {
  const graph = newDefinition()
  const condition = insertNode(graph, graph.edges[0], 'condition', 'Production?')
  const branch = graph.edges.find(e => e.source === condition.id && e.condition)
  assert.equal(removeNode(graph, branch.target), false)
  assert.equal(paths(graph).length, 2)
})
