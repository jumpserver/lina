import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

import {
  branchConversationMessage,
  cancelApproval as cancelApprovalRequest,
  cancelConversation,
  confirmApproval as confirmApprovalRequest,
  createConversation,
  deleteConversation as deleteConversationRequest,
  getApproval,
  getChatAIBootstrap,
  listConversationMessages,
  listConversations,
  regenerateConversationMessage,
  streamConversationMessage,
  updateConversation
} from '@/api/chatAi'

const APPROVAL_STORAGE_KEY = 'jumpserver_chat_ai_pending_approvals'
const OUTPUT_EVENTS = new Set([
  'model.requested',
  'message.delta',
  'tool.call',
  'tool.progress',
  'tool.completed',
  'tool.failed',
  'tool.cancelled',
  'approval.required',
  'message.completed'
])

function temporaryId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.name === 'CanceledError' ||
    error?.code === 'ERR_CANCELED'
  )
}

function serverResults(response) {
  return response?.results || []
}

function versionedMessages(items, selections) {
  const entries = []
  const answersBySource = new Map()
  let latestUserId = ''

  for (const message of items) {
    if (message.role === 'user') {
      latestUserId = message.id
      entries.push(message)
      continue
    }

    if (message.role !== 'assistant') {
      entries.push(message)
      continue
    }

    // Kael records regenerated_from_id as the source user message, so every
    // answer for the same user turn belongs to one version group.
    const sourceUserId = message.regenerated_from_id || latestUserId
    let group = answersBySource.get(sourceUserId)
    if (!group) {
      group = { _source_user_id: sourceUserId, _versions: [] }
      answersBySource.set(sourceUserId, group)
      const sourceIndex = entries.findIndex((entry) => entry.id === sourceUserId)
      if (message.regenerated_from_id && sourceIndex >= 0) entries.splice(sourceIndex + 1, 0, group)
      else entries.push(group)
    }
    group._versions.push(message)
  }

  return entries.map((entry) => {
    if (!entry._versions) return entry
    const versions = entry._versions
    if (versions.length === 1) return versions[0]
    const rootId = entry._source_user_id || versions[0].id
    const selectedId = selections[rootId]
    let index = versions.findIndex((version) => version.id === selectedId)
    if (index < 0) index = versions.length - 1
    return {
      ...versions[index],
      version: {
        root_id: rootId,
        index: index + 1,
        total: versions.length,
        previous_id: versions[index - 1]?.id || '',
        next_id: versions[index + 1]?.id || '',
        latest_id: versions.at(-1).id
      }
    }
  })
}

function sourceUserMessageId(items, messageId) {
  let index = items.findIndex((message) => message.id === messageId)
  const regeneratedFromId = items[index]?.regenerated_from_id
  if (regeneratedFromId && items.some((message) => message.id === regeneratedFromId)) {
    return regeneratedFromId
  }
  while (index >= 0 && items[index].role !== 'user') index -= 1
  return items[index]?.id || ''
}

function readApprovalStorage() {
  try {
    return JSON.parse(sessionStorage.getItem(APPROVAL_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeApprovalStorage(value) {
  try {
    sessionStorage.setItem(APPROVAL_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Session storage is an enhancement; approval still works in this page lifetime.
  }
}

function rememberApproval(conversationId, approvalId) {
  const value = readApprovalStorage()
  value[conversationId] = approvalId
  writeApprovalStorage(value)
}

function forgetApproval(conversationId) {
  const value = readApprovalStorage()
  delete value[conversationId]
  writeApprovalStorage(value)
}

function approvalView(value, messageId) {
  const preview = value.preview || {}
  return {
    ...value,
    operation_id: preview.operation_id || value.tool_call_id,
    method: preview.method || 'TOOL',
    path: preview.path || preview.tool_name || value.tool_call_id,
    risk_level: value.risk,
    preview,
    messageId
  }
}

function normalizeMessage(message) {
  return {
    id: message.id,
    _render_key: message._render_key || message.id,
    role: message.role,
    content: message.content || '',
    status: message.status || 'completed',
    model: message.model || '',
    error: message.error || '',
    input_tokens: message.input_tokens || 0,
    output_tokens: message.output_tokens || 0,
    images: (message.images || []).map((image) => ({ ...image })),
    files: (message.files || []).map((file) => ({ ...file })),
    result_cards: Array.isArray(message.result_cards)
      ? message.result_cards.map((card) => ({ ...card }))
      : [],
    regenerated_from_id: message.regenerated_from_id || null,
    pending_approval_id: message.pending_approval_id || '',
    run_state: message.run_state || '',
    date_created: message.date_created || new Date().toISOString()
  }
}

function restoredTrace(message) {
  const items = []
  for (const [index, card] of (message.result_cards || []).entries()) {
    if (card?.type === 'progress' && card?.content?.text) {
      items.push({
        id: `restored-progress-${message.id}-${index}`,
        type: 'progress',
        status: 'completed',
        data: { content: card.content.text },
        timestamp: Date.parse(card.content.timestamp || '') || 0
      })
      continue
    }
    if (card?.source?.type === 'core_api') {
      items.push({
        id: `restored-api-${message.id}-${index}`,
        type: 'api_call',
        status: Number(card.source.status_code) >= 400 ? 'failed' : 'completed',
        data: {
          operation_id: card.source.operation_id || '',
          action: card.source.action || '',
          summary: card.title || ''
        },
        timestamp: Date.parse(card.source.timestamp || '') || 0
      })
    }
  }
  return items
}

function revokeLocalAttachments(items) {
  for (const item of items || []) {
    for (const image of item.images || []) {
      if (image.local && image.url) URL.revokeObjectURL(image.url)
    }
    for (const file of item.files || []) {
      if (file.local && file.url) URL.revokeObjectURL(file.url)
    }
  }
}

export function useChatAi(options = {}) {
  const conversations = ref([])
  const activeConversationId = ref('')
  const messages = ref([])
  const answerVersionSelections = ref({})
  const traces = ref({})
  const approval = ref(null)
  const loadingConversations = ref(false)
  const loadingMessages = ref(false)
  const streaming = ref(false)
  const stopping = ref(false)
  const approvalProcessing = ref(false)
  const preparing = ref(false)
  const initialized = ref(false)
  const lastError = ref(null)
  const features = ref({
    artifacts: false,
    branch: false,
    regenerate: false
  })

  let abortController = null
  let temporaryAssistantId = ''
  let activeStreamMessageId = ''
  let stopRequested = false
  let remoteRunPollTimer = null
  let streamConversationId = ''
  let streamTools = new Map()
  let messagesRequestId = 0
  let lifecycleActive = true

  const activeConversation = computed(() => {
    return conversations.value.find((item) => item.id === activeConversationId.value) || null
  })

  function isGeneralConversation(value) {
    return value?.kind === 'general'
  }

  function generalConversation(id) {
    return conversations.value.find((item) => item.id === id && isGeneralConversation(item)) || null
  }

  const rawVisibleMessages = computed(() => {
    return messages.value.filter((item) => item.role !== 'tool' && item.role !== 'system')
  })

  const visibleMessages = computed(() => {
    return versionedMessages(rawVisibleMessages.value, answerVersionSelections.value)
  })

  const latestAssistantMessageId = computed(() => {
    return (
      [...rawVisibleMessages.value].reverse().find((item) => item.role === 'assistant')?.id || ''
    )
  })
  const pendingApprovalMessage = computed(() => {
    return (
      [...rawVisibleMessages.value]
        .reverse()
        .find((item) => item.pending_approval_id || item.status === 'awaiting_approval') || null
    )
  })
  const awaitingApproval = computed(() => {
    return approval.value?.status === 'pending' || Boolean(pendingApprovalMessage.value)
  })
  const remoteRunActive = computed(() => {
    return !streaming.value && rawVisibleMessages.value.some((item) => Boolean(item.run_state))
  })
  const recoverableRun = computed(() => {
    return remoteRunActive.value && !awaitingApproval.value
  })
  const busy = computed(() => {
    return (
      streaming.value ||
      stopping.value ||
      approvalProcessing.value ||
      preparing.value ||
      awaitingApproval.value ||
      recoverableRun.value
    )
  })

  function emitError(error) {
    lastError.value = error
    options.onError?.(error)
  }

  function updateConversationLocally(id, changes) {
    const index = conversations.value.findIndex((item) => item.id === id)
    if (index === -1) return
    conversations.value[index] = { ...conversations.value[index], ...changes }
    conversations.value.sort((a, b) => new Date(b.date_updated) - new Date(a.date_updated))
  }

  async function loadConversations({ selectFirst = false, silent = false } = {}) {
    if (!silent) loadingConversations.value = true
    try {
      const response = await listConversations({ kind: 'general' })
      lastError.value = null
      conversations.value = serverResults(response).filter(isGeneralConversation)
      if (
        activeConversationId.value &&
        !conversations.value.some((item) => item.id === activeConversationId.value)
      ) {
        activeConversationId.value = ''
      }
      if (selectFirst && !activeConversationId.value && conversations.value.length) {
        await selectConversation(conversations.value[0].id)
      }
      return true
    } catch (error) {
      emitError(error)
      return false
    } finally {
      if (!silent) loadingConversations.value = false
    }
  }

  async function restoreApproval() {
    approval.value = null
    const conversationId = activeConversationId.value
    const message = pendingApprovalMessage.value
    if (!conversationId) return

    const approvalId = message?.pending_approval_id || readApprovalStorage()[conversationId]
    if (!approvalId) {
      if (!message) return
      approval.value = {
        id: '',
        status: 'pending',
        recovery: true,
        conversation: conversationId,
        messageId: message.id
      }
      return
    }

    try {
      const data = await getApproval(approvalId)
      if (data.status !== 'pending') {
        forgetApproval(conversationId)
        return
      }
      if (!message) return
      rememberApproval(conversationId, data.id)
      approval.value = approvalView(data, message.id)
    } catch {
      if (!message) return
      approval.value = {
        id: '',
        status: 'pending',
        recovery: true,
        conversation: conversationId,
        messageId: message.id
      }
    }
  }

  function clearRemoteRunPoll() {
    if (remoteRunPollTimer) window.clearTimeout(remoteRunPollTimer)
    remoteRunPollTimer = null
  }

  function scheduleRemoteRunPoll(id) {
    clearRemoteRunPoll()
    if (!lifecycleActive || activeConversationId.value !== id || !remoteRunActive.value) return
    remoteRunPollTimer = window.setTimeout(async () => {
      remoteRunPollTimer = null
      if (!lifecycleActive) return
      await loadMessages(id, { silent: true })
    }, 2000)
  }

  async function loadMessages(id = activeConversationId.value, { silent = false } = {}) {
    const requestId = ++messagesRequestId
    if (!id) {
      clearRemoteRunPoll()
      revokeLocalAttachments(messages.value)
      messages.value = []
      approval.value = null
      return true
    }
    if (!generalConversation(id)) {
      clearRemoteRunPoll()
      if (activeConversationId.value === id) activeConversationId.value = ''
      revokeLocalAttachments(messages.value)
      messages.value = []
      approval.value = null
      return false
    }
    if (!silent) {
      loadingMessages.value = true
      lastError.value = null
    }
    try {
      const data = await listConversationMessages(id)
      if (requestId !== messagesRequestId || activeConversationId.value !== id) return false
      const renderKeys = new Map(
        messages.value.map((message) => [message.id, message._render_key || message.id])
      )
      revokeLocalAttachments(messages.value)
      messages.value = data.map((message) => {
        const normalized = normalizeMessage(message)
        normalized._render_key = renderKeys.get(normalized.id) || normalized._render_key
        return normalized
      })
      traces.value = Object.fromEntries(
        messages.value
          .map((message) => [message.id, restoredTrace(message)])
          .filter(([, items]) => items.length)
      )
      await restoreApproval()
      lastError.value = null
      return true
    } catch (error) {
      if (!silent && requestId === messagesRequestId && activeConversationId.value === id) {
        emitError(error)
      }
      return false
    } finally {
      if (!silent && requestId === messagesRequestId) loadingMessages.value = false
      if (requestId === messagesRequestId && activeConversationId.value === id) {
        scheduleRemoteRunPoll(id)
      }
    }
  }

  async function initialize() {
    if (initialized.value) return
    try {
      const bootstrap = await getChatAIBootstrap()
      features.value = {
        artifacts: bootstrap.features.artifacts === true,
        branch: bootstrap.features.branch === true,
        regenerate: bootstrap.features.regenerate === true
      }
    } catch (error) {
      emitError(error)
      return
    }
    initialized.value = await loadConversations({ selectFirst: true })
  }

  async function selectConversation(id) {
    if (!id) return true
    if (!generalConversation(id)) return false
    if (id === activeConversationId.value) return true
    if (busy.value) return false
    clearRemoteRunPoll()
    activeConversationId.value = id
    revokeLocalAttachments(messages.value)
    messages.value = []
    approval.value = null
    lastError.value = null
    await loadMessages(id)
    await nextTick()
    return true
  }

  function newConversation() {
    if (busy.value) return false
    clearRemoteRunPoll()
    activeConversationId.value = ''
    revokeLocalAttachments(messages.value)
    messages.value = []
    approval.value = null
    lastError.value = null
    return true
  }

  function selectAnswerVersion(rootId, messageId) {
    if (!rootId || !messageId || streaming.value) return
    answerVersionSelections.value = {
      ...answerVersionSelections.value,
      [rootId]: messageId
    }
  }

  async function removeConversation(id) {
    await deleteConversationRequest(id)
    forgetApproval(id)
    const wasActive = activeConversationId.value === id
    conversations.value = conversations.value.filter((item) => item.id !== id)
    if (wasActive) {
      activeConversationId.value = ''
      revokeLocalAttachments(messages.value)
      messages.value = []
      approval.value = null
      if (conversations.value.length) await selectConversation(conversations.value[0].id)
    }
  }

  async function renameConversation(id, title) {
    const conversation = await updateConversation(id, { title })
    updateConversationLocally(id, conversation)
    return conversation
  }

  function messageById(id) {
    return messages.value.find((item) => item.id === id)
  }

  function transferTemporaryMessage(realId) {
    for (const [rootId, selectedId] of Object.entries(answerVersionSelections.value)) {
      if (selectedId === temporaryAssistantId) {
        answerVersionSelections.value = {
          ...answerVersionSelections.value,
          [rootId]: realId
        }
        break
      }
    }
    const message = messageById(temporaryAssistantId)
    if (message) message.id = realId
    if (traces.value[temporaryAssistantId]) {
      traces.value[realId] = traces.value[temporaryAssistantId]
      delete traces.value[temporaryAssistantId]
    }
    activeStreamMessageId = realId
    temporaryAssistantId = ''
  }

  function appendTrace(type, data, status = 'running') {
    const messageId = activeStreamMessageId || temporaryAssistantId
    if (!messageId) return
    const items = traces.value[messageId] || []
    items.push({
      id: temporaryId(type),
      type,
      data,
      status,
      timestamp: Date.now()
    })
    traces.value[messageId] = items
  }

  function updateLastTrace(type, matcher, changes) {
    const messageId = activeStreamMessageId || temporaryAssistantId
    const items = traces.value[messageId] || []
    const item = [...items].reverse().find((entry) => {
      return entry.type === type && (!matcher || matcher(entry))
    })
    if (item) {
      const nextChanges = typeof changes === 'function' ? changes(item) : changes
      Object.assign(item, nextChanges)
      item.timestamp = Date.now()
      return true
    }
    return false
  }

  function touchLastTrace() {
    const messageId = activeStreamMessageId || temporaryAssistantId
    const item = (traces.value[messageId] || []).at(-1)
    if (item) item.timestamp = Date.now()
  }

  function toolTraceData(delivery) {
    const payload = delivery.payload || {}
    const toolCallId = delivery.tool_call_id || payload.tool_call_id || ''
    const previous = streamTools.get(toolCallId) || {}
    const argumentsValue = payload.arguments || previous.arguments || {}
    const preview = payload.preview || {}
    const toolName = payload.tool_name || previous.tool_name || ''
    const data = {
      operation_id:
        argumentsValue.operation_id || preview.operation_id || previous.operation_id || toolCallId,
      action: argumentsValue.action || previous.action || toolName,
      method: preview.method || previous.method || 'TOOL',
      path: preview.path || previous.path || toolName,
      tool_name: toolName,
      tool_call_id: toolCallId,
      arguments: argumentsValue,
      risk_level: payload.risk || previous.risk_level || ''
    }
    if (toolCallId) streamTools.set(toolCallId, data)
    return data
  }

  function isApiSearch(data) {
    return (
      String(data.tool_name || data.path || '')
        .split('.')
        .at(-1) === 'search_core_api'
    )
  }

  function handleStreamEvent(delivery) {
    const event = delivery.type
    const data = delivery.payload || {}
    if (!activeStreamMessageId && delivery.message_id && OUTPUT_EVENTS.has(event)) {
      transferTemporaryMessage(delivery.message_id)
    }
    const assistant = messageById(activeStreamMessageId || temporaryAssistantId)

    switch (event) {
      case 'message.delta': {
        const target = messageById(activeStreamMessageId || temporaryAssistantId)
        if (target) target.content += data.delta || ''
        break
      }
      case 'tool.call': {
        const trace = toolTraceData(delivery)
        const traceType = isApiSearch(trace) ? 'api_search' : 'api_call'
        const traceData =
          traceType === 'api_search' ? { ...trace, query: trace.arguments.query || '' } : trace
        const updated =
          Boolean(trace.tool_call_id) &&
          updateLastTrace(
            traceType,
            (entry) => entry.data.tool_call_id === trace.tool_call_id,
            (entry) => ({ status: 'running', data: { ...entry.data, ...traceData } })
          )
        if (!updated) appendTrace(traceType, traceData, 'running')
        break
      }
      case 'tool.progress': {
        const content = data.message || data.detail || ''
        if (content) appendTrace('progress', { content }, 'completed')
        break
      }
      case 'tool.completed':
      case 'tool.failed':
      case 'tool.cancelled': {
        const trace = toolTraceData(delivery)
        const result = data.result || {}
        const ok = event === 'tool.completed' && data.status !== 'failed' && result.ok !== false
        const completed = {
          ...trace,
          ...result,
          ok,
          status: result.ok === false ? result.status_code || data.status : data.status,
          status_code: result.status_code,
          error: data.error || result.error || ''
        }
        const traceType = isApiSearch(trace) ? 'api_search' : 'api_call'
        updateLastTrace(
          traceType,
          (entry) => entry.data.tool_call_id === trace.tool_call_id,
          (entry) => ({
            status: ok ? 'completed' : 'failed',
            data: {
              ...entry.data,
              ...completed,
              ...(traceType === 'api_search'
                ? { operationCount: result.operations?.length || 0 }
                : {})
            }
          })
        )
        break
      }
      case 'approval.required': {
        const messageId = activeStreamMessageId || temporaryAssistantId
        const trace = toolTraceData(delivery)
        const preview = data.preview || {}
        const approvalId = delivery.approval_id || data.approval_id
        approval.value = approvalView(
          {
            ...data,
            id: approvalId,
            approval_id: approvalId,
            status: 'pending',
            conversation: delivery.conversation_id,
            preview: {
              ...preview,
              operation_id: preview.operation_id || trace.operation_id,
              method: preview.method || trace.method,
              path: preview.path || trace.path
            }
          },
          messageId
        )
        rememberApproval(activeConversationId.value, approvalId)
        const updated = updateLastTrace(
          'api_call',
          (entry) => entry.data.tool_call_id === trace.tool_call_id,
          (entry) => ({
            status: 'approval',
            data: { ...entry.data, ...trace }
          })
        )
        if (!updated) appendTrace('api_call', trace, 'approval')
        break
      }
      case 'approval.resolved': {
        const conversationId = delivery.conversation_id || activeConversationId.value
        const approvalId = delivery.approval_id || data.approval_id
        const storedApprovalId = readApprovalStorage()[conversationId]
        if (storedApprovalId === approvalId) forgetApproval(conversationId)
        if (
          approval.value?.id === approvalId ||
          (approval.value?.recovery && storedApprovalId === approvalId)
        ) {
          approval.value = null
        }
        break
      }
      case 'message.completed': {
        touchLastTrace()
        const target = messageById(delivery.message_id) || assistant
        if (target) {
          target.status = data.status
          target.error = data.error || ''
          target.input_tokens = data.input_tokens || 0
          target.output_tokens = data.output_tokens || 0
        }
        break
      }
      case 'run.failed': {
        const target = messageById(delivery.message_id) || assistant
        if (target) {
          target.status = 'failed'
          target.error = data.reason || data.error_code
        }
        appendTrace('error', { detail: data.reason, code: data.error_code }, 'failed')
        break
      }
      case 'run.cancelled':
        if (assistant) assistant.status = 'cancelled'
        break
      default:
        break
    }
  }

  async function ensureConversation(content, requestOptions = {}) {
    if (activeConversationId.value && isGeneralConversation(activeConversation.value)) {
      return activeConversation.value
    }
    activeConversationId.value = ''
    const title = content.trim().replace(/\s+/g, ' ').slice(0, 80)
    const conversation = await createConversation(
      { kind: 'general', profile: 'general', title },
      requestOptions
    )
    if (!isGeneralConversation(conversation)) {
      throw new Error('Kael returned a non-general conversation to the Lina assistant.')
    }
    return conversation
  }

  async function sendMessage(rawContent, imageFiles = [], options = {}) {
    const content = String(rawContent || '')
    const images = Array.from(imageFiles || [])
    const files = Array.from(options.files || [])
    if ((!content.trim() && !images.length && !files.length) || busy.value || !lifecycleActive) {
      return false
    }

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    const title = content.trim() || files[0]?.name || 'Image'
    const requestController = new AbortController()
    abortController = requestController
    let conversation
    preparing.value = true
    try {
      conversation = await ensureConversation(title, { signal: requestController.signal })
    } catch (error) {
      if (!isAbortError(error) && !stopRequested) emitError(error)
      if (abortController === requestController) abortController = null
      streamConversationId = ''
      if (!stopping.value) stopRequested = false
      return false
    } finally {
      preparing.value = false
    }
    if (requestController.signal.aborted || stopRequested || !lifecycleActive) {
      if (abortController === requestController) abortController = null
      streamConversationId = ''
      if (!stopping.value) stopRequested = false
      return false
    }
    streamConversationId = conversation.id
    streamTools = new Map()
    const now = new Date().toISOString()
    let accepted = false
    function acceptMessage() {
      if (accepted) return
      accepted = true
      if (!generalConversation(conversation.id)) conversations.value.unshift(conversation)
      activeConversationId.value = conversation.id
      updateConversationLocally(conversation.id, {
        title: conversation.title || title.replace(/\s+/g, ' ').slice(0, 80),
        date_updated: now
      })
      options.onAccepted?.()
    }
    const userMessage = normalizeMessage({
      id: temporaryId('user'),
      role: 'user',
      content,
      images: images.map((image) => ({
        name: image.name,
        content_type: image.type,
        size: image.size,
        url: URL.createObjectURL(image),
        file: image,
        local: true
      })),
      files: files.map((file) => ({
        name: file.name,
        content_type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
        local: true
      })),
      status: 'completed',
      date_created: now
    })
    temporaryAssistantId = temporaryId('assistant')
    activeStreamMessageId = ''
    const assistantMessage = normalizeMessage({
      id: temporaryAssistantId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      date_created: now
    })
    messages.value.push(userMessage, assistantMessage)
    traces.value[temporaryAssistantId] = []
    streaming.value = true

    try {
      await streamConversationMessage(conversation.id, content, {
        conversation,
        images,
        files,
        signal: requestController.signal,
        onEvent: handleStreamEvent,
        onAccepted: acceptMessage
      })
      return true
    } catch (error) {
      if (!isAbortError(error) && !stopRequested) {
        const target = messageById(activeStreamMessageId || temporaryAssistantId)
        if (target) {
          target.status = 'failed'
          target.error = error.detail || error.message
        }
        emitError(error)
      }
      return false
    } finally {
      streaming.value = false
      if (abortController === requestController) abortController = null
      streamConversationId = ''
      temporaryAssistantId = ''
      activeStreamMessageId = ''
      if (!stopRequested && lifecycleActive) {
        await loadMessages(conversation.id, { silent: true })
        await loadConversations({ silent: true })
      }
    }
  }

  async function stopGeneration() {
    if (stopping.value || approvalProcessing.value) return
    const conversationId = streamConversationId || activeConversationId.value
    stopping.value = true
    stopRequested = true
    abortController?.abort()
    if (!conversationId) {
      stopping.value = false
      if (!preparing.value) stopRequested = false
      return
    }
    try {
      await cancelConversation(conversationId)
    } catch (error) {
      emitError(error)
    } finally {
      forgetApproval(conversationId)
      approval.value = null
      if (lifecycleActive) {
        await loadMessages(conversationId)
        await loadConversations({ silent: true })
      }
      stopping.value = false
      stopRequested = false
    }
  }

  async function confirmApproval() {
    if (!approval.value?.id || approvalProcessing.value) return null
    const approvalId = approval.value.id
    const conversationId = activeConversationId.value
    const liveStream = streaming.value && streamConversationId === conversationId
    approvalProcessing.value = true
    try {
      const response = await confirmApprovalRequest(approvalId)
      forgetApproval(conversationId)
      if (approval.value?.id === approvalId) approval.value = null
      if (!liveStream) {
        await loadMessages(conversationId)
        await loadConversations({ silent: true })
      }
      return response
    } catch (error) {
      emitError(error)
      throw error
    } finally {
      approvalProcessing.value = false
    }
  }

  async function rejectApproval() {
    if (approvalProcessing.value) return
    if (!approval.value?.id) {
      await stopGeneration()
      return
    }
    const approvalId = approval.value.id
    const conversationId = activeConversationId.value
    const liveStream = streaming.value && streamConversationId === conversationId
    approvalProcessing.value = true
    try {
      await cancelApprovalRequest(approvalId)
      forgetApproval(conversationId)
      if (approval.value?.id === approvalId) approval.value = null
      if (!liveStream) {
        await loadMessages(conversationId)
        await loadConversations({ silent: true })
      }
    } catch (error) {
      emitError(error)
      throw error
    } finally {
      approvalProcessing.value = false
    }
  }

  async function branchMessage(messageId, rawContent) {
    const sourceConversation = activeConversation.value
    const sourceMessage = messageById(messageId)
    const content = String(rawContent || '')
    if (
      !sourceConversation ||
      sourceMessage?.role !== 'user' ||
      busy.value ||
      content === sourceMessage.content ||
      (!content.trim() && !sourceMessage.images?.length && !sourceMessage.files?.length)
    ) {
      return false
    }

    const sourceIndex = messages.value.findIndex((item) => item.id === messageId)
    if (sourceIndex < 0) return false
    const branchPrefix = messages.value.slice(0, sourceIndex).map(normalizeMessage)
    const now = new Date().toISOString()
    const editedMessage = normalizeMessage({
      ...sourceMessage,
      id: temporaryId('user'),
      content,
      date_created: now
    })
    temporaryAssistantId = temporaryId('assistant')
    const assistantMessage = normalizeMessage({
      id: temporaryAssistantId,
      role: 'assistant',
      status: 'streaming',
      date_created: now
    })
    let branchConversationId = ''
    let branchActivated = false

    function activateBranch(id) {
      if (!id || branchActivated) return
      branchActivated = true
      branchConversationId = id
      streamConversationId = id
      activeConversationId.value = id
      approval.value = null
      messages.value = [...branchPrefix, editedMessage, assistantMessage]
      traces.value[temporaryAssistantId] = []
      const title =
        content.trim().replace(/\s+/g, ' ').slice(0, 80) ||
        sourceMessage.files?.[0]?.name ||
        'Branch'
      conversations.value.unshift({
        ...sourceConversation,
        id,
        title,
        status: 'active',
        date_created: now,
        date_updated: now
      })
    }

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    activeStreamMessageId = ''
    streaming.value = true
    streamConversationId = ''
    streamTools = new Map()
    abortController = new AbortController()

    try {
      await branchConversationMessage(sourceConversation.id, messageId, content, {
        signal: abortController.signal,
        onConversation: activateBranch,
        onEvent: handleStreamEvent
      })
      return true
    } catch (error) {
      if (!isAbortError(error) && !stopRequested) {
        const target = messageById(activeStreamMessageId || temporaryAssistantId)
        if (branchActivated && target) {
          target.status = 'failed'
          target.error = error.detail || error.message
        }
        emitError(error)
      }
      return false
    } finally {
      streaming.value = false
      streamConversationId = ''
      abortController = null
      temporaryAssistantId = ''
      activeStreamMessageId = ''
      if (branchConversationId && !stopRequested && lifecycleActive) {
        await loadMessages(branchConversationId, { silent: true })
      }
      if (lifecycleActive) await loadConversations({ silent: true })
    }
  }

  async function regenerateMessage(messageId) {
    if (!messageId || busy.value) return false
    const conversationId = activeConversationId.value
    if (!conversationId) return false
    const versionRootId = sourceUserMessageId(messages.value, messageId)
    if (!versionRootId) return false
    streamConversationId = conversationId
    streamTools = new Map()

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    temporaryAssistantId = temporaryId('assistant')
    answerVersionSelections.value = {
      ...answerVersionSelections.value,
      [versionRootId]: temporaryAssistantId
    }
    activeStreamMessageId = ''
    messages.value.push(
      normalizeMessage({
        id: temporaryAssistantId,
        role: 'assistant',
        status: 'streaming',
        regenerated_from_id: versionRootId,
        date_created: new Date().toISOString()
      })
    )
    traces.value[temporaryAssistantId] = []
    streaming.value = true
    abortController = new AbortController()

    try {
      await regenerateConversationMessage(conversationId, messageId, {
        signal: abortController.signal,
        onEvent: handleStreamEvent
      })
      return true
    } catch (error) {
      if (!isAbortError(error) && !stopRequested) {
        const target = messageById(activeStreamMessageId || temporaryAssistantId)
        if (target) {
          target.status = 'failed'
          target.error = error.detail || error.message
        }
        emitError(error)
      }
      return false
    } finally {
      streaming.value = false
      abortController = null
      streamConversationId = ''
      temporaryAssistantId = ''
      activeStreamMessageId = ''
      if (!stopRequested && lifecycleActive) {
        await loadMessages(conversationId, { silent: true })
        await loadConversations({ silent: true })
      }
    }
  }

  function deactivateLifecycle() {
    if (!lifecycleActive) return
    lifecycleActive = false
    clearRemoteRunPoll()
    messagesRequestId += 1
    loadingMessages.value = false
    if (abortController) {
      stopRequested = true
      abortController.abort()
    }
  }

  async function activateLifecycle() {
    if (lifecycleActive) return
    lifecycleActive = true
    if (!initialized.value) return
    await loadConversations({ silent: true })
    if (!lifecycleActive) return
    if (!activeConversationId.value) {
      await loadMessages('', { silent: true })
      return
    }
    await loadMessages(activeConversationId.value, { silent: true })
  }

  onBeforeUnmount(() => {
    deactivateLifecycle()
    revokeLocalAttachments(messages.value)
  })

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    visibleMessages,
    latestAssistantMessageId,
    traces,
    approval,
    loadingConversations,
    loadingMessages,
    streaming,
    stopping,
    approvalProcessing,
    preparing,
    initialized,
    lastError,
    features,
    awaitingApproval,
    recoverableRun,
    busy,
    initialize,
    loadConversations,
    loadMessages,
    selectConversation,
    newConversation,
    selectAnswerVersion,
    removeConversation,
    renameConversation,
    sendMessage,
    stopGeneration,
    confirmApproval,
    rejectApproval,
    branchMessage,
    regenerateMessage,
    activateLifecycle,
    deactivateLifecycle
  }
}
