const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const READ_TOOLS = new Set(['search_core_api'])
const FAILURE_CODES = new Set([
  'model_authentication',
  'model_rate_limit',
  'model_unavailable',
  'model_invalid_output',
  'model_timeout',
  'model_invalid_request',
  'permission_denied',
  'approval_expired',
  'approval_rejected',
  'tool_timeout',
  'capability_unavailable',
  'storage_unavailable',
  'run_timeout',
  'process_restarted',
  'worker_interrupted',
  'run_failed',
  'cancelled',
  'interrupted'
])

export function normalizeFailure(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return {
    stage: String(value.stage || ''),
    code: String(value.code || ''),
    tool_name: String(value.tool_name || ''),
    failed_step:
      value.failed_step &&
      typeof value.failed_step === 'object' &&
      !Array.isArray(value.failed_step)
        ? { ...value.failed_step }
        : null,
    next_action: String(value.next_action || ''),
    local: value.local === true,
    completed_steps: Array.isArray(value.completed_steps)
      ? value.completed_steps
          .filter((step) => step?.status === 'success')
          .map((step) => ({ ...step }))
      : [],
    uncertain_steps: Array.isArray(value.uncertain_steps)
      ? value.uncertain_steps
          .filter((step) => step && typeof step === 'object')
          .map((step) => ({ ...step }))
      : []
  }
}

function isReadStep(step) {
  if (typeof step.read_only === 'boolean') return step.read_only
  const method = String(step.method || '').toUpperCase()
  if (method && method !== 'TOOL') return READ_METHODS.has(method)
  return READ_TOOLS.has(
    String(step.tool_name || '')
      .split('.')
      .at(-1)
  )
}

function stepKey(step) {
  return step.tool_call_id || `${step.operation_id || step.tool_name || ''}:${step.method || ''}`
}

function uniqueSteps(steps) {
  return [...new Map(steps.map((step) => [stepKey(step), step])).values()]
}

function traceStep(item) {
  const data = item.data || {}
  const source = data.source || {}
  return {
    tool_call_id: data.tool_call_id,
    tool_name:
      data.tool_name || source.tool_name || (item.type === 'api_search' ? 'search_core_api' : ''),
    operation_id: source.operation_id || data.operation_id,
    method: source.method || data.method,
    read_only: typeof data.read_only === 'boolean' ? data.read_only : source.read_only
  }
}

// Older messages have result cards but no stored execution trace or failure object.
function observedSteps(message, trace) {
  const completed = []
  const uncertain = []
  for (const card of message.result_cards || []) {
    const source = card?.source
    if (!source || source.type !== 'core_api') continue
    const status = Number(source.status_code)
    if (status >= 200 && status < 300) {
      completed.push({ ...source, status: 'success' })
    }
  }
  for (const item of trace || []) {
    if (!['api_call', 'api_search'].includes(item.type)) continue
    const step = traceStep(item)
    if (item.status === 'completed' && item.data?.ok !== false) {
      completed.push({ ...step, status: 'success' })
    } else if (['running', 'failed'].includes(item.status) && !isReadStep(step)) {
      uncertain.push(step)
    }
  }
  const completedKeys = new Set(completed.map(stepKey))
  return {
    completed: uniqueSteps(completed),
    uncertain: uniqueSteps(uncertain).filter((step) => !completedKeys.has(stepKey(step)))
  }
}

export function messageFailure(message, trace = []) {
  const failure = normalizeFailure(message.failure)
  const observed = observedSteps(message, trace)
  const completed =
    failure && !failure.local
      ? failure.completed_steps
      : uniqueSteps([...(failure?.completed_steps || []), ...observed.completed])
  const uncertain =
    failure && !failure.local
      ? failure.uncertain_steps
      : uniqueSteps([...(failure?.uncertain_steps || []), ...observed.uncertain])
  const hasCompletedWrites = completed.some((step) => !isReadStep(step))
  const hasUncertainWrites = uncertain.some((step) => !isReadStep(step))
  const code =
    failure?.code ||
    message.error_code ||
    (message.status === 'cancelled' ? 'cancelled' : 'run_failed')
  return {
    ...failure,
    code: FAILURE_CODES.has(code) ? code : 'run_failed',
    stage:
      failure?.stage ||
      (code.startsWith('model_')
        ? 'model'
        : ['approval_expired', 'approval_rejected'].includes(code)
          ? 'approval'
          : 'interrupted'),
    completed_steps: completed,
    uncertain_steps: uncertain,
    hasCompletedWrites,
    hasUncertainWrites,
    next_action: hasUncertainWrites
      ? 'inspect_resource'
      : hasCompletedWrites
        ? 'review_completed'
        : failure?.next_action || defaultAction(code)
  }
}

function defaultAction(code) {
  if (['model_authentication', 'model_invalid_request'].includes(code)) return 'check_model_config'
  if (code === 'permission_denied') return 'check_permissions'
  if (code === 'approval_expired') return 'approve_again'
  if (code === 'approval_rejected') return 'continue'
  if (code === 'cancelled') return 'continue'
  if (['storage_unavailable', 'capability_unavailable'].includes(code)) return 'contact_admin'
  return 'retry_later'
}

export function canRetryMessage(message, trace = []) {
  const failure = messageFailure(message, trace)
  return (
    !failure.hasCompletedWrites &&
    !failure.hasUncertainWrites &&
    !['check_model_config', 'check_permissions', 'approve_again', 'contact_admin'].includes(
      failure.next_action
    )
  )
}

export function failureFromError(error, stage = 'interrupted') {
  const supplied = normalizeFailure(error?.failure || error?.response?.data?.failure)
  if (supplied) return supplied
  const rawCode = error?.code || error?.response?.data?.code || ''
  const status = Number(error?.status || error?.response?.status)
  let code = FAILURE_CODES.has(rawCode) ? rawCode : 'run_failed'
  if (status === 401 || status === 403) code = 'permission_denied'
  else if (String(rawCode).startsWith('storage_')) code = 'storage_unavailable'
  else if (stage === 'preparing' && status === 503) code = 'storage_unavailable'
  else if (
    rawCode === 'identity_unavailable' ||
    String(rawCode).startsWith('service_capability_') ||
    String(rawCode).startsWith('capability_')
  ) {
    code = 'capability_unavailable'
  } else if (rawCode === 'approval_not_pending') code = 'approval_expired'
  else if (
    ['stream_disconnected', 'stream_interrupted', 'ERR_NETWORK', 'ECONNABORTED'].includes(
      rawCode
    ) ||
    error?.name === 'TypeError'
  ) {
    code = 'interrupted'
  }
  return {
    stage,
    code,
    completed_steps: [],
    uncertain_steps: [],
    next_action: defaultAction(code),
    local: true
  }
}

export function failureText(failure, t) {
  const reasons = {
    model_authentication: 'ChatAIFailureModelAuthentication',
    model_rate_limit: 'ChatAIFailureModelRateLimit',
    model_unavailable: 'ChatAIFailureModelUnavailable',
    model_invalid_output: 'ChatAIFailureModelInvalidOutput',
    model_timeout: 'ChatAIFailureModelTimeout',
    model_invalid_request: 'ChatAIFailureModelInvalidRequest',
    permission_denied: 'ChatAIFailurePermissionDenied',
    approval_expired: 'ChatAIFailureApprovalExpired',
    approval_rejected: 'ChatAIFailureApprovalRejected',
    tool_timeout: 'ChatAIFailureToolTimeout',
    capability_unavailable: 'ChatAIFailureCapabilityUnavailable',
    storage_unavailable: 'ChatAIFailureStorageUnavailable',
    run_timeout: 'ChatAIFailureRunTimeout',
    process_restarted: 'ChatAIFailureProcessRestarted',
    worker_interrupted: 'ChatAIFailureInterrupted',
    cancelled: 'ChatAIFailureCancelled',
    interrupted: 'ChatAIFailureInterrupted',
    run_failed: 'ChatAIFailureUnknown'
  }
  const actions = {
    retry_later: 'ChatAIFailureRetryLater',
    check_model_config: 'ChatAIFailureCheckModelConfig',
    check_permissions: 'ChatAIFailureCheckPermissions',
    approve_again: 'ChatAIFailureApproveAgain',
    inspect_resource: 'ChatAIFailureInspectResource',
    review_completed: 'ChatAIFailureReviewCompleted',
    contact_admin: 'ChatAIFailureContactAdmin',
    continue: 'ChatAIFailureContinue'
  }
  const action = t(actions[failure.next_action] || actions.contact_admin)
  const remediation = defaultAction(failure.code)
  const retainRemediation =
    ['inspect_resource', 'review_completed'].includes(failure.next_action) &&
    ['check_model_config', 'check_permissions', 'approve_again', 'contact_admin'].includes(
      remediation
    )
  return {
    reason: t(reasons[failure.code] || reasons.run_failed),
    action: retainRemediation ? `${t(actions[remediation])} ${action}` : action
  }
}

export function friendlyChatError(error, t) {
  const code = error?.code || error?.response?.data?.code
  if (['conversation_busy', 'run_queue_full'].includes(code)) return t('ChatAIConversationBusy')
  if (code === 'page_context_failed') return t('ChatAIFailurePageContext')
  if (code === 'page_context_organization_changed') return t('ChatAIFailurePageContextOrganization')
  const stage = error?.chatAiStage || 'interrupted'
  const failure = failureFromError(error, stage)
  const text = failureText(failure, t)
  if (stage !== 'preparing') return `${text.reason} ${text.action}`

  const action =
    failure.next_action === 'contact_admin'
      ? t('ChatAIFailureContactAdminBeforeStart')
      : t('ChatAIFailureRetryBeforeStart')
  return `${t('ChatAIFailureBeforeStartSummary')} ${text.reason} ${action}`
}
