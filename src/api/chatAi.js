import router from '@/router'
import store from '@/store'
import { withBaseApi } from '@/utils/env'
import { getTokenFromCookie } from '@/utils/jms/auth'
import request from '@/utils/request'

const KAEL_BASE = '/kael/api/v1'
const PAGE_SIZE = 100
const HEARTBEAT_MS = 30 * 1000
const PANEL_STREAM_RECONNECT_ATTEMPTS = 4
const PANEL_STREAM_RECONNECT_BASE_DELAY_MS = 300
const RUN_CREATE_RECOVERY_ATTEMPTS = 8
const RUN_CREATE_RECOVERY_DELAY_MS = 250
const ARTIFACT_METADATA_CONCURRENCY = 4
const ARTIFACT_METADATA_CACHE_LIMIT = 256
const TERMINAL_RUN_STATES = new Set(['completed', 'failed', 'cancelled'])
const ACTIVE_RUN_STATES = new Set([
  'queued',
  'running',
  'waiting_capability',
  'waiting_approval',
  'cancelling'
])
const activeRuns = new Map()
const runAttempts = new Map()
const approvals = new Map()
const artifacts = new Map()
let clientInstanceId = ''

export class ChatAIRequestError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ChatAIRequestError'
    this.status = options.status || 0
    this.code = options.code || ''
    this.detail = options.detail || message
    this.retryable = options.retryable === true
    this.requestId = options.requestId || ''
  }
}

function quietRequest(config) {
  return request({ disableFlashErrorMsg: true, ...config })
}

function randomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return Date.now() + '-' + Math.random().toString(16).slice(2)
}

function getClientInstanceId() {
  if (!clientInstanceId) clientInstanceId = 'lina-' + randomId()
  return clientInstanceId
}

function pick(data, keys) {
  return Object.fromEntries(
    keys
      .filter((key) => data[key] !== undefined && data[key] !== null)
      .map((key) => [key, data[key]])
  )
}

export function getChatAIBootstrap() {
  return quietRequest({ url: KAEL_BASE + '/bootstrap', method: 'get' })
}

export async function listConversations(params = {}) {
  const results = []
  const limit = params.limit || PAGE_SIZE
  let offset = params.offset || 0
  let count = 0

  while (true) {
    const page = await quietRequest({
      url: KAEL_BASE + '/conversations',
      method: 'get',
      params: {
        limit,
        offset,
        ...(params.kind ? { kind: params.kind } : {})
      }
    })
    results.push(...page.results)
    count = page.count
    offset += page.results.length
    if (!page.results.length || offset >= count) return { results, count }
  }
}

export function createConversation(data = {}, options = {}) {
  return quietRequest({
    url: KAEL_BASE + '/conversations',
    method: 'post',
    data: pick(data, ['kind', 'assistant', 'profile', 'surface', 'title', 'metadata']),
    signal: options.signal
  })
}

function getConversation(id, signal) {
  return quietRequest({ url: KAEL_BASE + '/conversations/' + id, method: 'get', signal })
}

export function updateConversation(id, data, options = {}) {
  return quietRequest({
    url: KAEL_BASE + '/conversations/' + id,
    method: 'patch',
    data: pick(data, ['title', 'assistant', 'archived']),
    signal: options.signal
  })
}

export function deleteConversation(id) {
  return quietRequest({ url: KAEL_BASE + '/conversations/' + id, method: 'delete' })
}

function artifactContentUrl(id) {
  return KAEL_BASE + '/artifacts/' + id + '/content'
}

function rememberArtifact(value) {
  if (!value?.id) return value
  const cached = {
    ...(artifacts.get(value.id) || {}),
    ...pick(value, ['id', 'kind', 'name', 'media_type', 'size', 'status', 'date_created'])
  }
  artifacts.delete(value.id)
  artifacts.set(value.id, cached)
  while (artifacts.size > ARTIFACT_METADATA_CACHE_LIMIT) {
    artifacts.delete(artifacts.keys().next().value)
  }
  return cached
}

function artifactAttachment(value) {
  const id = value.artifact_id
  const artifact = artifacts.get(id) || { id }
  return {
    id,
    name: artifact.name || 'attachment-' + id.slice(0, 8),
    content_type: artifact.media_type || '',
    size: Number(artifact.size || 0),
    kind: artifact.kind || 'file',
    url: artifactContentUrl(id)
  }
}

function withMessageAttachments(message) {
  const images = []
  const files = []
  for (const part of message.parts) {
    if (part.type !== 'artifact' || !part.artifact_id) continue
    const attachment = artifactAttachment(part)
    if (attachment.kind === 'image') images.push(attachment)
    else files.push(attachment)
  }
  return { ...message, images, files }
}

async function listAllMessages(id, signal) {
  const values = []
  let offset = 0
  while (true) {
    const page = await quietRequest({
      url: KAEL_BASE + '/conversations/' + id + '/messages',
      method: 'get',
      params: { limit: PAGE_SIZE, offset },
      signal
    })
    const results = page.results
    values.push(...results)
    offset += results.length
    if (!results.length || offset >= page.count) return values
  }
}

export async function listConversationMessages(id, options = {}) {
  const messages = await listAllMessages(id, options.signal)
  const [runtime] = await Promise.all([
    conversationRuntime(id, options.signal),
    hydrateMessageArtifacts(messages, options.signal)
  ])
  return messages.map(withMessageAttachments).map((message) => {
    const runState = runtime.runStatesByMessage.get(message.id)
    const approvalId = runtime.pendingApprovalsByMessage.get(message.id)
    const value = runState ? { ...message, run_state: runState } : message
    if (!approvalId) return value
    return { ...value, status: 'awaiting_approval', pending_approval_id: approvalId }
  })
}

async function conversationRuntime(conversationId, signal) {
  const [approvalPage, runPage] = await Promise.all([
    quietRequest({
      url: KAEL_BASE + '/conversations/' + conversationId + '/approvals',
      method: 'get',
      params: { limit: PAGE_SIZE, offset: 0 },
      signal
    }),
    quietRequest({
      url: KAEL_BASE + '/conversations/' + conversationId + '/runs',
      method: 'get',
      params: { limit: PAGE_SIZE, offset: 0 },
      signal
    })
  ])
  const runsById = new Map(runPage.results.map((run) => [run.id, run]))
  const runStatesByMessage = new Map()
  const pendingApprovalsByMessage = new Map()

  for (const run of runPage.results) {
    if (!ACTIVE_RUN_STATES.has(run.state)) continue
    if (run.input_message_id) runStatesByMessage.set(run.input_message_id, run.state)
    if (run.output_message_id) runStatesByMessage.set(run.output_message_id, run.state)
  }
  for (const approval of approvalPage.results) {
    if (approval.status !== 'pending') continue
    approvals.set(approval.id, approval)
    const messageId = runsById.get(approval.run_id)?.output_message_id
    if (messageId) pendingApprovalsByMessage.set(messageId, approval.id)
  }
  return { runStatesByMessage, pendingApprovalsByMessage }
}

async function hydrateMessageArtifacts(messages, signal) {
  const ids = new Set()
  for (const message of messages) {
    for (const part of message.parts) {
      if (part?.type === 'artifact' && part.artifact_id) ids.add(part.artifact_id)
    }
  }

  const missing = [...ids].filter((id) => !artifacts.has(id))
  let cursor = 0
  const workers = Array.from(
    { length: Math.min(ARTIFACT_METADATA_CONCURRENCY, missing.length) },
    async () => {
      while (cursor < missing.length) {
        const id = missing[cursor++]
        try {
          rememberArtifact(
            await quietRequest({
              url: KAEL_BASE + '/artifacts/' + id,
              method: 'get',
              signal
            })
          )
        } catch (error) {
          if (signal?.aborted || error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
            throw abortError()
          }
        }
      }
    }
  )
  await Promise.all(workers)
}

function abortError() {
  if (typeof DOMException === 'function') {
    return new DOMException('The operation was aborted.', 'AbortError')
  }
  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

function beginRunAttempt(conversationId, signal) {
  const attempt = {
    conversationId,
    signal,
    runId: '',
    cancelled: false,
    cancellationPromise: null
  }
  runAttempts.set(conversationId, attempt)
  return attempt
}

function moveRunAttempt(attempt, conversationId) {
  if (runAttempts.get(attempt.conversationId) === attempt) {
    runAttempts.delete(attempt.conversationId)
  }
  attempt.conversationId = conversationId
  runAttempts.set(conversationId, attempt)
}

function endRunAttempt(attempt) {
  if (runAttempts.get(attempt.conversationId) === attempt) {
    runAttempts.delete(attempt.conversationId)
  }
}

function throwIfRunAttemptCancelled(attempt) {
  if (attempt.cancelled || attempt.signal?.aborted) throw abortError()
}

async function cancelRunById(conversationId, runId) {
  const value = await quietRequest({
    url: KAEL_BASE + '/runs/' + runId + '/cancel',
    method: 'post',
    data: { reason: 'user' }
  })
  if (TERMINAL_RUN_STATES.has(value?.state)) activeRuns.delete(conversationId)
  return value
}

function markRunAttemptCancelled(attempt) {
  attempt.cancelled = true
  if (attempt.runId && !attempt.cancellationPromise) {
    attempt.cancellationPromise = cancelRunById(attempt.conversationId, attempt.runId)
    attempt.cancellationPromise.catch(() => {})
  }
}

async function registerRunAttempt(attempt, run) {
  attempt.runId = run.id
  activeRuns.set(attempt.conversationId, run.id)
  if (attempt.cancelled) {
    markRunAttemptCancelled(attempt)
    try {
      await attempt.cancellationPromise
    } catch {
      // The caller still receives AbortError; explicit Stop requests surface cancellation failures.
    }
    throw abortError()
  }
  if (attempt.signal?.aborted) throw abortError()
}

async function reconcileRunAttemptCancellation(attempt) {
  markRunAttemptCancelled(attempt)
  if (attempt.cancellationPromise) {
    try {
      await attempt.cancellationPromise
    } catch {
      // Best effort after the local AbortSignal has already stopped orchestration.
    }
    return
  }
  try {
    const run = await findActiveRun(attempt.conversationId)
    if (!run?.id) return
    attempt.runId = run.id
    markRunAttemptCancelled(attempt)
    await attempt.cancellationPromise
  } catch {
    // The AbortSignal already stopped client orchestration; a committed Run is reconciled best effort.
  }
}

async function findActiveRun(conversationId) {
  const knownId = activeRuns.get(conversationId)
  if (knownId) return { id: knownId }
  const page = await quietRequest({
    url: KAEL_BASE + '/conversations/' + conversationId + '/runs',
    method: 'get',
    params: { limit: PAGE_SIZE, offset: 0 }
  })
  return page.results.find((run) => ACTIVE_RUN_STATES.has(run.state)) || null
}

function isAmbiguousRunCreateError(error) {
  const status = Number(error?.response?.status || 0)
  return !error?.response || status === 408 || status === 425 || status >= 500
}

function recoveryDelay() {
  return new Promise((resolve) => window.setTimeout(resolve, RUN_CREATE_RECOVERY_DELAY_MS))
}

async function recoverRunByInputMessage(conversationId, inputMessageId, createRun, attempt) {
  for (let index = 0; index < RUN_CREATE_RECOVERY_ATTEMPTS; index += 1) {
    try {
      const page = await quietRequest({
        url: KAEL_BASE + '/conversations/' + conversationId + '/runs',
        method: 'get',
        params: { limit: PAGE_SIZE, offset: 0 }
      })
      const candidate = page.results.find((run) => run.input_message_id === inputMessageId)
      if (candidate) return candidate
    } catch {
      // The create response and recovery query may fail on the same transient network outage.
    }

    if (!attempt.cancelled && !attempt.signal?.aborted) {
      try {
        return await createRun()
      } catch (error) {
        if (!isAmbiguousRunCreateError(error)) throw error
      }
    }

    if (index + 1 < RUN_CREATE_RECOVERY_ATTEMPTS) await recoveryDelay()
  }
  return null
}

export async function cancelConversation(id) {
  const attempt = runAttempts.get(id)
  if (attempt) {
    markRunAttemptCancelled(attempt)
    if (attempt.cancellationPromise) return attempt.cancellationPromise
  }
  const run = await findActiveRun(id)
  if (!run?.id) return { state: attempt ? 'cancelling' : 'idle' }
  return cancelRunById(id, run.id)
}

export function getAuditedConversation(id, options = {}) {
  return quietRequest({
    url: KAEL_BASE + '/admin/audit/conversations/' + id,
    method: 'get',
    signal: options.signal
  })
}

export async function getApproval(id) {
  const value = await quietRequest({ url: KAEL_BASE + '/approvals/' + id, method: 'get' })
  approvals.set(value.id, value)
  return value
}

async function decideApproval(id, decision) {
  const approval = approvals.get(id) || (await getApproval(id))
  const value = await quietRequest({
    url: KAEL_BASE + '/approvals/' + id + '/decisions',
    method: 'post',
    data: {
      decision,
      run_id: approval.run_id,
      arguments_digest: approval.arguments_digest
    }
  })
  approvals.set(id, value)
  return value
}

export function confirmApproval(id) {
  return decideApproval(id, 'approve')
}

export function cancelApproval(id) {
  return decideApproval(id, 'reject')
}

function currentRoute() {
  return router.currentRoute.value
}

function nativeHeaders(accept = 'application/json') {
  const headers = { Accept: accept }
  const csrfToken = getTokenFromCookie()
  const orgId = currentRoute().query?.oid || store.getters.currentOrg?.id
  if (csrfToken) headers['X-CSRFToken'] = csrfToken
  if (orgId) headers['X-JMS-ORG'] = orgId
  try {
    headers['X-TZ'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    // Kael falls back to its server timezone.
  }
  return headers
}

async function responseError(response) {
  let payload = {}
  try {
    payload = await response.json()
  } catch {}
  const detail = payload.detail || 'Chat AI request failed with HTTP ' + response.status
  throw new ChatAIRequestError(detail, {
    status: response.status,
    code: payload?.code || '',
    detail,
    retryable: payload?.retryable === true,
    requestId: payload?.request_id || response.headers.get('X-Request-ID') || ''
  })
}

function parseEventBlock(block) {
  const data = []
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    let value = separator === -1 ? '' : line.slice(separator + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'data') data.push(value)
  }
  if (!data.length) return null
  return JSON.parse(data.join('\n'))
}

function nextBoundary(buffer) {
  const match = /\r?\n\r?\n/.exec(buffer)
  return match ? { index: match.index, length: match[0].length } : null
}

async function consumeEventStream(response, panel, run, cursor, onEvent) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  function consume(delivery) {
    if (!delivery) return null
    const sequence = Number(delivery.seq)
    if (!Number.isSafeInteger(sequence) || sequence < 1) {
      throw new ChatAIRequestError('Kael returned an invalid event sequence.', {
        code: 'invalid_event_sequence'
      })
    }
    if (sequence <= cursor.sequence) return null
    if (delivery.panel_session_id && delivery.panel_session_id !== panel.id) {
      throw new ChatAIRequestError('Kael returned an event for another panel session.', {
        code: 'panel_event_mismatch'
      })
    }
    if (!delivery.run_id || delivery.run_id === run.id) onEvent?.(delivery)
    cursor.sequence = sequence
    const terminal =
      delivery.run_id === run.id &&
      delivery.type.startsWith('run.') &&
      TERMINAL_RUN_STATES.has(delivery.type.slice(4))
    if (!terminal) return null
    return {
      terminal: true,
      failure:
        delivery.type === 'run.failed'
          ? {
              code: delivery.payload.error_code || 'run_failed',
              detail: delivery.payload.reason || 'Chat AI run failed.'
            }
          : null
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
      let boundary = nextBoundary(buffer)
      while (boundary) {
        const block = buffer.slice(0, boundary.index)
        buffer = buffer.slice(boundary.index + boundary.length)
        if (block.trim()) {
          const terminal = consume(parseEventBlock(block))
          if (terminal) return terminal
        }
        boundary = nextBoundary(buffer)
      }
      if (done) break
    }
    if (buffer.trim()) {
      const terminal = consume(parseEventBlock(buffer))
      if (terminal) return terminal
    }
    throw new ChatAIRequestError(
      'Kael event stream ended before the run reached a terminal state.',
      {
        code: 'stream_ended',
        retryable: true
      }
    )
  } finally {
    try {
      await reader.cancel()
    } catch {
      // A disconnected reader is already closed.
    }
  }
}

function isRetryablePanelStreamError(error) {
  const status = Number(error?.status || 0)
  return (
    error?.retryable === true ||
    error?.code === 'stream_ended' ||
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500 ||
    error instanceof TypeError
  )
}

function waitForPanelReconnect(attempt, signal) {
  const delay = PANEL_STREAM_RECONNECT_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1)
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)
    function handleAbort() {
      window.clearTimeout(timer)
      signal?.removeEventListener('abort', handleAbort)
      reject(abortError())
    }
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

async function uploadArtifact(file, kind, signal) {
  const data = new FormData()
  data.append('file', file)
  data.append('kind', kind)
  return rememberArtifact(
    await quietRequest({
      url: KAEL_BASE + '/artifacts',
      method: 'post',
      data,
      signal,
      timeout: 2 * 60 * 1000
    })
  )
}

async function deleteArtifacts(values) {
  await Promise.allSettled(
    values.map((artifact) =>
      quietRequest({ url: KAEL_BASE + '/artifacts/' + artifact.id, method: 'delete' })
    )
  )
}

async function createUserMessage(conversationId, content, images = [], files = [], signal) {
  const uploaded = []
  try {
    for (const file of images) uploaded.push(await uploadArtifact(file, 'image', signal))
    for (const file of files) uploaded.push(await uploadArtifact(file, 'file', signal))
    const message = await quietRequest({
      url: KAEL_BASE + '/conversations/' + conversationId + '/messages',
      method: 'post',
      data: {
        role: 'user',
        content,
        artifact_ids: uploaded.map((artifact) => artifact.id),
        idempotency_key: randomId()
      },
      signal
    })
    return message
  } catch (error) {
    await deleteArtifacts(uploaded)
    throw error
  }
}

function createPanel(conversation, signal) {
  return quietRequest({
    url: KAEL_BASE + '/panel-sessions',
    method: 'post',
    data: {
      conversation_id: conversation.id,
      surface: conversation.surface || 'lina.chat',
      profile: conversation.profile,
      client_instance_id: getClientInstanceId(),
      approval_mode: 'auto'
    },
    signal
  })
}

function capabilityMode(conversation) {
  if (conversation.kind === 'capability') return 'panel'
  if (
    conversation.kind === 'general' ||
    String(conversation.profile || '').startsWith('platform.')
  ) {
    return 'service'
  }
  return 'disabled'
}

async function closePanel(id) {
  try {
    await quietRequest({ url: KAEL_BASE + '/panel-sessions/' + id, method: 'delete' })
  } catch {
    // The panel lease provides server-side cleanup if this best-effort request fails.
  }
}

async function streamPanelRun(conversation, panel, run, options = {}) {
  const heartbeat = window.setInterval(() => {
    quietRequest({
      url: KAEL_BASE + '/panel-sessions/' + panel.id + '/heartbeat',
      method: 'post'
    }).catch(() => {})
  }, HEARTBEAT_MS)
  const cursor = { sequence: 0 }
  let reconnectAttempt = 0
  try {
    while (true) {
      try {
        const headers = nativeHeaders('text/event-stream')
        headers['Last-Event-ID'] = String(cursor.sequence)
        const response = await fetch(
          withBaseApi(
            KAEL_BASE + '/panel-sessions/' + panel.id + '/events?after=' + cursor.sequence
          ),
          {
            method: 'GET',
            credentials: 'include',
            headers,
            signal: options.signal
          }
        )
        if (!response.ok) await responseError(response)
        if (!response.body) {
          throw new ChatAIRequestError('Streaming is not supported by this browser.')
        }
        const terminal = await consumeEventStream(response, panel, run, cursor, options.onEvent)
        activeRuns.delete(conversation.id)
        if (terminal.failure) {
          throw new ChatAIRequestError(terminal.failure.detail, terminal.failure)
        }
        return
      } catch (error) {
        if (options.signal?.aborted) throw abortError()
        if (
          reconnectAttempt >= PANEL_STREAM_RECONNECT_ATTEMPTS ||
          !isRetryablePanelStreamError(error)
        ) {
          throw error
        }
        reconnectAttempt += 1
        await waitForPanelReconnect(reconnectAttempt, options.signal)
      }
    }
  } finally {
    window.clearInterval(heartbeat)
    await closePanel(panel.id)
  }
}

async function createAndStreamRun(conversation, inputMessageId, options, attempt) {
  throwIfRunAttemptCancelled(attempt)
  const panel = await createPanel(conversation, options.signal)
  const idempotencyKey = randomId()
  const runPayload = {
    conversation_id: conversation.id,
    input_message_id: inputMessageId,
    panel_session_id: panel.id,
    execution_mode: 'foreground',
    capability_mode: capabilityMode(conversation),
    idempotency_key: idempotencyKey
  }
  const createRun = () =>
    quietRequest({
      url: KAEL_BASE + '/runs',
      method: 'post',
      data: runPayload
    })
  let run
  try {
    throwIfRunAttemptCancelled(attempt)
    try {
      run = await createRun()
    } catch (error) {
      if (!isAmbiguousRunCreateError(error)) throw error
      run = await recoverRunByInputMessage(conversation.id, inputMessageId, createRun, attempt)
      if (!run) throw error
    }
    await registerRunAttempt(attempt, run)
  } catch (error) {
    await closePanel(panel.id)
    throw error
  }
  try {
    options.onAccepted?.(run)
  } catch {
    // UI acknowledgement must not interrupt an accepted Run.
  }
  await streamPanelRun(conversation, panel, run, options)
}

export async function streamConversationMessage(id, content, options = {}) {
  const attempt = beginRunAttempt(id, options.signal)
  try {
    let conversation = options.conversation || (await getConversation(id, options.signal))
    throwIfRunAttemptCancelled(attempt)
    if (!conversation.title) {
      const title =
        String(content || '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 80) ||
        options.files?.[0]?.name ||
        options.images?.[0]?.name ||
        ''
      if (title) conversation = await updateConversation(id, { title }, options)
    }
    throwIfRunAttemptCancelled(attempt)
    const message = await createUserMessage(
      id,
      String(content || ''),
      options.images || [],
      options.files || [],
      options.signal
    )
    throwIfRunAttemptCancelled(attempt)
    await createAndStreamRun(conversation, message.id, options, attempt)
  } catch (error) {
    if (attempt.cancelled) {
      await reconcileRunAttemptCancellation(attempt)
      throw abortError()
    }
    if (options.signal?.aborted) throw abortError()
    throw error
  } finally {
    endRunAttempt(attempt)
  }
}

function filenameFromDisposition(value, fallback) {
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(value || '')?.[1]
  if (encoded) {
    try {
      return decodeURIComponent(encoded)
    } catch {
      return encoded
    }
  }
  return /filename="?([^";]+)"?/i.exec(value || '')?.[1] || fallback
}

export async function fetchChatAIArtifact(attachment, options = {}) {
  if (attachment?.file instanceof Blob) return attachment.file
  if (!attachment?.id) {
    throw new ChatAIRequestError('The attachment is missing its artifact ID.', {
      code: 'artifact_id_missing'
    })
  }
  const response = await fetch(withBaseApi(artifactContentUrl(attachment.id)), {
    method: 'GET',
    credentials: 'include',
    headers: nativeHeaders('*/*'),
    signal: options.signal
  })
  if (!response.ok) await responseError(response)
  const blob = await response.blob()
  const fallback = attachment.name || 'attachment-' + attachment.id.slice(0, 8)
  const name = filenameFromDisposition(response.headers.get('Content-Disposition'), fallback)
  return new File([blob], name, { type: blob.type || attachment.content_type })
}

async function cloneAttachments(message, signal) {
  const images = []
  const files = []
  for (const item of message.images || []) {
    images.push(await fetchChatAIArtifact(item, { signal }))
  }
  for (const item of message.files || []) {
    files.push(await fetchChatAIArtifact(item, { signal }))
  }
  return { images, files }
}

export async function regenerateConversationMessage(id, messageId, options = {}) {
  const attempt = beginRunAttempt(id, options.signal)
  try {
    const [conversation, messages] = await Promise.all([
      getConversation(id, options.signal),
      listAllMessages(id, options.signal)
    ])
    throwIfRunAttemptCancelled(attempt)
    let index = messages.findIndex((message) => message.id === messageId)
    if (index < 0) {
      throw new ChatAIRequestError('The message to regenerate was not found.', {
        code: 'message_not_found'
      })
    }
    const selected = messages[index]
    let input = selected.regenerated_from_id
      ? messages.find((message) => message.id === selected.regenerated_from_id)
      : null
    while (!input && index >= 0 && messages[index].role !== 'user') index -= 1
    if (!input) input = messages[index]
    if (input?.role !== 'user') {
      throw new ChatAIRequestError('A source user message is required to regenerate this answer.', {
        code: 'regeneration_source_missing'
      })
    }
    const panel = await createPanel(conversation, options.signal)
    let run
    try {
      throwIfRunAttemptCancelled(attempt)
      run = await quietRequest({
        url: KAEL_BASE + '/messages/' + input.id + '/regenerations',
        method: 'post',
        data: { panel_session_id: panel.id }
      })
      await registerRunAttempt(attempt, run)
    } catch (error) {
      await closePanel(panel.id)
      throw error
    }
    await streamPanelRun(conversation, panel, run, options)
  } catch (error) {
    if (attempt.cancelled) {
      await reconcileRunAttemptCancellation(attempt)
      throw abortError()
    }
    if (options.signal?.aborted) throw abortError()
    throw error
  } finally {
    endRunAttempt(attempt)
  }
}

export async function branchConversationMessage(id, messageId, content, options = {}) {
  const attempt = beginRunAttempt(id, options.signal)
  try {
    const [sourceConversation, sourceMessages] = await Promise.all([
      getConversation(id, options.signal),
      listConversationMessages(id, { signal: options.signal })
    ])
    throwIfRunAttemptCancelled(attempt)
    const sourceIndex = sourceMessages.findIndex((message) => message.id === messageId)
    const source = sourceMessages[sourceIndex]
    if (sourceIndex < 0 || source?.role !== 'user') {
      throw new ChatAIRequestError('A source user message is required to create a branch.', {
        code: 'branch_source_missing'
      })
    }
    const title =
      String(content || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 80) ||
      source.files?.[0]?.name ||
      sourceConversation.title ||
      'Branch'
    let branch
    if (sourceIndex > 0) {
      branch = await quietRequest({
        url: KAEL_BASE + '/conversations/' + id + '/branches',
        method: 'post',
        data: { message_id: sourceMessages[sourceIndex - 1].id, title },
        signal: options.signal
      })
    } else {
      branch = await createConversation(
        {
          kind: sourceConversation.kind,
          assistant: sourceConversation.assistant,
          profile: sourceConversation.profile,
          surface: sourceConversation.surface,
          title,
          metadata: sourceConversation.metadata
        },
        options
      )
    }
    moveRunAttempt(attempt, branch.id)
    options.onConversation?.(branch.id)
    throwIfRunAttemptCancelled(attempt)
    const cloned = await cloneAttachments(source, options.signal)
    throwIfRunAttemptCancelled(attempt)
    const message = await createUserMessage(
      branch.id,
      String(content || ''),
      cloned.images,
      cloned.files,
      options.signal
    )
    throwIfRunAttemptCancelled(attempt)
    await createAndStreamRun(branch, message.id, options, attempt)
  } catch (error) {
    if (attempt.cancelled) {
      await reconcileRunAttemptCancellation(attempt)
      throw abortError()
    }
    if (options.signal?.aborted) throw abortError()
    throw error
  } finally {
    endRunAttempt(attempt)
  }
}
