import { hasPermission } from '@/utils/jms/permission'

// Only these Core resources have a verified Lina detail page. In particular,
// audit jobs and job logs are not the same resources as ops jobs.
const resourceRoutes = [
  {
    resources: [
      'assets_assets',
      'assets_hosts',
      'assets_databases',
      'assets_devices',
      'assets_clouds',
      'assets_webs',
      'assets_gpts',
      'assets_customs',
      'assets_gateways'
    ],
    actions: ['list', 'retrieve', 'create', 'update', 'partial_update'],
    name: 'AssetDetail',
    permission: 'assets.view_asset'
  },
  {
    resources: ['assets_nodes_assets'],
    actions: ['list'],
    name: 'AssetDetail',
    permission: 'assets.view_asset'
  },
  {
    resources: ['users_users'],
    actions: ['list', 'retrieve', 'create', 'update', 'partial_update'],
    name: 'UserDetail',
    permission: 'users.view_user'
  },
  {
    resources: ['terminal_sessions'],
    actions: ['list', 'retrieve'],
    name: 'SessionDetail',
    permission: 'terminal.view_session'
  },
  {
    resources: ['ops_jobs'],
    actions: ['list', 'retrieve'],
    name: 'JobDetail',
    permission: 'ops.view_job'
  },
  {
    resources: ['audits_login_logs', 'audits_my_login_logs'],
    actions: ['list', 'retrieve'],
    name: 'LoginLogDetail',
    permission: 'audits.view_userloginlog'
  },
  {
    resources: ['audits_operate_logs'],
    actions: ['list', 'retrieve'],
    name: 'OperateLogDetail',
    permission: 'audits.view_operatelog'
  }
]

const operationRoutes = new Map()
for (const route of resourceRoutes) {
  for (const resource of route.resources) {
    for (const action of route.actions) {
      operationRoutes.set(`${resource}_${action}`, route)
    }
  }
}

function explicitResourceId(row) {
  for (const candidate of [row?._resource_id, row?.id, row?.pk]) {
    if (typeof candidate !== 'string' && !Number.isSafeInteger(candidate)) continue
    const id = String(candidate).trim()
    if (/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id)) return id
  }
  // _key can be a row index in older cards and is deliberately not an ID.
  return ''
}

export function resultDetailRoute(card, row, router, currentRoute) {
  const source = card?.source
  if (
    source?.type !== 'core_api' ||
    !Number.isInteger(source.status_code) ||
    source.status_code < 200 ||
    source.status_code >= 300
  ) {
    return null
  }
  const target = operationRoutes.get(source.operation_id)
  const id = explicitResourceId(row)
  if (!target || !id || !hasPermission(target.permission) || !router.hasRoute(target.name)) {
    return null
  }

  const location = { name: target.name, params: { id } }
  // Lina's request client uses oid before the active organization. Preserve
  // this one trusted page parameter, never query parameters from tool output.
  const oid = currentRoute?.query?.oid
  if (typeof oid === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(oid)) {
    location.query = { oid }
  }
  const resolved = router.resolve(location)
  if (
    !resolved.matched.length ||
    resolved.matched.some((route) => !hasPermission(route.meta?.permissions))
  ) {
    return null
  }
  return location
}
