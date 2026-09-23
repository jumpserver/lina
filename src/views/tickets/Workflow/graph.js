export const ticketTypes = [
  'apply_asset',
  'login_confirm',
  'login_asset_confirm',
  'command_confirm'
]
export const nodeLabels = {
  start: 'WFStart',
  approval: 'WFApproval',
  condition: 'WFCondition',
  end: 'WFEnd'
}
export const stateLabels = {
  pending: 'Pending',
  running: 'WFRunning',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'WFCancelled',
  expired: 'WFExpired',
  error: 'WFError',
  skipped: 'WFSkipped',
  transferred: 'WFTransferred'
}
export const eventLabels = {
  'workflow.started': 'WFStarted',
  'node.entered': 'WFNodeEntered',
  'node.completed': 'WFNodeCompleted',
  'approval.created': 'WFTaskCreated',
  'approval.approved': 'WFTaskApproved',
  'approval.rejected': 'WFTaskRejected',
  'approval.transferred': 'WFTransferred',
  'approval.added': 'WFAdded',
  'approval.cancelled': 'WFCancelled',
  'approval.expired': 'WFExpired',
  'approval.timed_out': 'WFExpired',
  'condition.evaluated': 'WFConditionEvaluated',
  'workflow.completed': 'WFCompleted',
  'workflow.cancelled': 'WFCancelled',
  'workflow.expired': 'WFExpired',
  'workflow.error': 'WFError',
  'action.executed': 'WFActionExecuted',
  'workflow.migrated': 'WFMigrated'
}
export const newApproval = () => ({
  approvers: { type: 'org_admin' },
  strategy: 'any',
  allow_transfer: true,
  allow_add_approver: true,
  exclude_applicant: true,
  timeout: 86400,
  timeout_action: 'expire'
})
export const newCondition = () => ({ field: 'asset.labels.env', operator: 'eq', value: 'prod' })
export function newDefinition() {
  return {
    nodes: [
      { id: 'start', type: 'start', name: '' },
      { id: 'approval_1', type: 'approval', name: '', config: newApproval() },
      { id: 'end', type: 'end', name: '' }
    ],
    edges: [
      { source: 'start', target: 'approval_1', condition: null },
      { source: 'approval_1', target: 'end', condition: null }
    ]
  }
}
export function layoutGraph(definition) {
  const levels = new Map([['start', 0]])
  const start = definition.nodes.find((n) => n.type === 'start')
  if (start) levels.set(start.id, 0)
  for (let i = 0; i < definition.nodes.length; i++) {
    for (const edge of definition.edges) {
      if (levels.has(edge.source)) {
        levels.set(edge.target, Math.max(levels.get(edge.target) || 0, levels.get(edge.source) + 1))
      }
    }
  }
  const rows = new Map()
  return definition.nodes.map((node) => {
    const level = levels.get(node.id) || 0
    const index = rows.get(level) || 0
    rows.set(level, index + 1)
    return { ...node, x: 50 + index * 250, y: 30 + level * 125 }
  })
}
export function insertNode(definition, edge, type, name) {
  const node = {
    id: `${type}_${crypto.randomUUID().slice(0, 8)}`,
    type,
    name,
    config: type === 'approval' ? newApproval() : newCondition()
  }
  definition.nodes.push(node)
  const target = edge.target
  edge.target = node.id
  if (type === 'condition') {
    // Separate branch cards make the branch meaning visible and editable.
    const branch = {
      id: `approval_${crypto.randomUUID().slice(0, 8)}`,
      type: 'approval',
      name: '',
      config: newApproval()
    }
    definition.nodes.push(branch)
    definition.edges.push(
      { source: node.id, target: branch.id, condition: true },
      { source: node.id, target, condition: false },
      { source: branch.id, target, condition: null }
    )
  } else definition.edges.push({ source: node.id, target, condition: null })
  return node
}
export function removeNode(definition, id) {
  const node = definition.nodes.find((n) => n.id === id)
  if (!node || node.type !== 'approval') return false
  const next = definition.edges.find((e) => e.source === id)?.target
  // A condition cannot point both branches at the same node.
  if (
    definition.edges.some(
      (e) =>
        e.target === id &&
        definition.edges.some(
          (other) => other !== e && other.source === e.source && other.target === next
        )
    )
  ) {
    return false
  }
  definition.edges
    .filter((e) => e.target === id)
    .forEach((e) => {
      e.target = next
    })
  definition.edges = definition.edges.filter((e) => e.source !== id)
  definition.nodes = definition.nodes.filter((n) => n.id !== id)
  return true
}
