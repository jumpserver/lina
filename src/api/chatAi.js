import router from '@/router'
import store from '@/store'
import { withBaseApi } from '@/utils/env'
import { getTokenFromCookie } from '@/utils/jms/auth'
import request from '@/utils/request'

const CHAT_AI_BASE = '/api/v1/chat-ai'
const PAGE_SIZE = 100

export class ChatAIRequestError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ChatAIRequestError'
    this.status = options.status || 0
    this.code = options.code || ''
    this.detail = options.detail || message
  }
}

function quietRequest(config) {
  return request({
    disableFlashErrorMsg: true,
    ...config
  })
}

export function listConversations(params = {}) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/conversations/`,
    method: 'get',
    params: {
      limit: PAGE_SIZE,
      ordering: '-date_updated',
      ...params
    }
  })
}

export function createConversation(data = {}) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/conversations/`,
    method: 'post',
    data
  })
}

export function updateConversation(id, data) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/conversations/${id}/`,
    method: 'patch',
    data
  })
}

export function deleteConversation(id) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/conversations/${id}/`,
    method: 'delete'
  })
}

export async function listConversationMessages(id) {
  let next = `${CHAT_AI_BASE}/conversations/${id}/messages/?limit=${PAGE_SIZE}`
  const messages = []

  while (next) {
    const page = await quietRequest({ url: next, method: 'get' })
    if (Array.isArray(page)) {
      messages.push(...page)
      break
    }
    messages.push(...(page?.results || []))
    next = page?.next || ''
  }

  return messages
}

export function cancelConversation(id) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/conversations/${id}/cancel/`,
    method: 'post'
  })
}

export function sendBackgroundConversationMessage(id, content, options = {}) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/conversations/${id}/messages/background/`,
    method: 'post',
    data: {
      content,
      web_search: options.webSearch === true,
      notify: options.notify !== false
    }
  })
}

export function getChatAIStats(days = 30) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/stats/`,
    method: 'get',
    params: { days }
  })
}

export function listAuditedConversations(params = {}) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/audit/conversations/`,
    method: 'get',
    params: {
      limit: 20,
      ordering: '-date_updated',
      ...params
    }
  })
}

export function getAuditedConversation(id) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/audit/conversations/${id}/`,
    method: 'get'
  })
}

export function getApproval(id) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/approvals/${id}/`,
    method: 'get'
  })
}

export function confirmApproval(id) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/approvals/${id}/confirm/`,
    method: 'post'
  })
}

export function cancelApproval(id) {
  return quietRequest({
    url: `${CHAT_AI_BASE}/approvals/${id}/cancel/`,
    method: 'post'
  })
}

export function transcribeAudio(file, language = '') {
  const data = new FormData()
  data.append('file', file)
  if (language) data.append('language', language)

  return quietRequest({
    url: `${CHAT_AI_BASE}/transcriptions/`,
    method: 'post',
    data,
    timeout: 2 * 60 * 1000
  })
}

function currentRoute() {
  return router.currentRoute?.value || router.currentRoute || {}
}

function streamHeaders(multipart = false) {
  const headers = {
    Accept: 'text/event-stream'
  }
  if (!multipart) headers['Content-Type'] = 'application/json'
  const csrfToken = getTokenFromCookie()
  const routeOrgId = currentRoute().query?.oid
  const storeOrgId = store.getters.currentOrg?.id
  const orgId = routeOrgId || storeOrgId

  if (csrfToken) headers['X-CSRFToken'] = csrfToken
  if (orgId) headers['X-JMS-ORG'] = orgId

  try {
    headers['X-TZ'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    // Browsers without Intl timezone support can still use Chat AI.
  }

  return headers
}

async function responseError(response) {
  let payload = {}
  try {
    payload = await response.json()
  } catch {
    try {
      payload = { detail: await response.text() }
    } catch {
      payload = {}
    }
  }

  const fieldError = Object.entries(payload || {}).find(([key]) => key !== 'code')?.[1]
  const detail =
    payload?.detail ||
    (Array.isArray(fieldError) ? fieldError[0] : fieldError) ||
    `Chat AI request failed with HTTP ${response.status}`
  throw new ChatAIRequestError(detail, {
    status: response.status,
    code: payload?.code || '',
    detail
  })
}

function parseEventBlock(block, onEvent) {
  let event = 'message'
  const data = []

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    let value = separator === -1 ? '' : line.slice(separator + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'event') event = value
    if (field === 'data') data.push(value)
  }

  if (!data.length) return ''

  const raw = data.join('\n')
  let payload = raw
  try {
    payload = JSON.parse(raw)
  } catch {
    // Keep non-JSON event data readable instead of dropping the stream.
  }
  onEvent?.({ event, data: payload })
  return event
}

function nextBoundary(buffer) {
  const match = /\r?\n\r?\n/.exec(buffer)
  if (!match) return null
  return { index: match.index, length: match[0].length }
}

export async function streamConversationMessage(id, content, options = {}) {
  const images = options.images || []
  const files = options.files || []
  const webSearch = options.webSearch === true
  const multipart = images.length > 0 || files.length > 0
  let body
  if (multipart) {
    body = new FormData()
    body.append('content', content)
    body.append('web_search', String(webSearch))
    images.forEach((image) => body.append('images', image))
    files.forEach((file) => body.append('files', file))
  } else {
    body = JSON.stringify({ content, web_search: webSearch })
  }
  const response = await fetch(
    withBaseApi(`${CHAT_AI_BASE}/conversations/${id}/messages/stream/`),
    {
      method: 'POST',
      credentials: 'include',
      headers: streamHeaders(multipart),
      body,
      signal: options.signal
    }
  )

  if (!response.ok) await responseError(response)
  if (!response.body) {
    throw new ChatAIRequestError('Streaming is not supported by this browser.')
  }

  await consumeEventStream(response, options.onEvent)
}

export async function regenerateConversationMessage(id, messageId, options = {}) {
  const response = await fetch(
    withBaseApi(`${CHAT_AI_BASE}/conversations/${id}/messages/${messageId}/regenerate/`),
    {
      method: 'POST',
      credentials: 'include',
      headers: streamHeaders(),
      body: JSON.stringify({ web_search: options.webSearch === true }),
      signal: options.signal
    }
  )

  if (!response.ok) await responseError(response)
  if (!response.body) {
    throw new ChatAIRequestError('Streaming is not supported by this browser.')
  }

  await consumeEventStream(response, options.onEvent)
}

export async function branchConversationMessage(id, messageId, content, options = {}) {
  const response = await fetch(
    withBaseApi(`${CHAT_AI_BASE}/conversations/${id}/messages/${messageId}/branch/`),
    {
      method: 'POST',
      credentials: 'include',
      headers: streamHeaders(),
      body: JSON.stringify({ content, web_search: options.webSearch === true }),
      signal: options.signal
    }
  )

  if (!response.ok) await responseError(response)
  if (!response.body) {
    throw new ChatAIRequestError('Streaming is not supported by this browser.')
  }

  options.onConversation?.(response.headers.get('X-Chat-AI-Conversation-ID') || '')
  await consumeEventStream(response, options.onEvent)
}

async function consumeEventStream(response, onEvent) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  const terminalEvents = new Set(['message_done', 'message_error'])

  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

    let boundary = nextBoundary(buffer)
    while (boundary) {
      const block = buffer.slice(0, boundary.index)
      buffer = buffer.slice(boundary.index + boundary.length)
      const event = block.trim() ? parseEventBlock(block, onEvent) : ''
      if (terminalEvents.has(event)) {
        await reader.cancel()
        return
      }
      boundary = nextBoundary(buffer)
    }

    if (done) break
  }

  if (buffer.trim()) parseEventBlock(buffer, onEvent)
}
