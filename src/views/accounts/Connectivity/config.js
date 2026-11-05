import { getRuntimeRoute } from '@/libs/context/runtime'

const types = {
  account: {
    prefix: 'AccountConnectivity',
    endpoint: 'verify-account',
    app: 'accounts',
    resource: 'verifyaccountautomation',
    executionResource: 'verifyaccountexecution',
    enabledFilter: 'verify_account_enabled'
  },
  asset: {
    prefix: 'AssetConnectivity',
    endpoint: 'ping',
    app: 'assets',
    resource: 'pingautomation',
    executionResource: 'pingexecution',
    enabledFilter: 'ping_enabled'
  }
}

export function getConnectivityConfig(type) {
  const config = types[type]
  if (!config) throw new Error(`Unknown connectivity task type: ${type}`)
  const { prefix, endpoint, app, resource, executionResource } = config
  return {
    ...config,
    type,
    url: `/api/v1/accounts/${endpoint}-automations/`,
    executionUrl: `/api/v1/accounts/${endpoint}-executions/`,
    relationUrl: `/api/v1/accounts/${endpoint}/`,
    taskTab: 'ConnectivityTasks',
    executionTab: 'ConnectivityExecutions',
    createRoute: `${prefix}Create`,
    updateRoute: `${prefix}Update`,
    detailRoute: `${prefix}Detail`,
    executionDetailRoute: `${prefix}ExecutionDetail`,
    viewPermission: `${app}.view_${resource}`,
    addPermission: `${app}.add_${resource}`,
    changePermission: `${app}.change_${resource}`,
    deletePermission: `${app}.delete_${resource}`,
    viewExecutionPermission: `${app}.view_${executionResource}`,
    executePermission: `${app}.add_${executionResource}`
  }
}

export function getConnectivityConfigForRow(row) {
  const type = row.type?.value || row.type
  return getConnectivityConfig(
    type === 'verify_account' ? 'account' : type === 'ping' ? 'asset' : type
  )
}

export const connectivityMixin = {
  props: {
    connectivityType: { type: String, default: '' }
  },
  computed: {
    connectivity() {
      return getConnectivityConfig(
        this.connectivityType || getRuntimeRoute(this).meta.connectivityType
      )
    }
  }
}
