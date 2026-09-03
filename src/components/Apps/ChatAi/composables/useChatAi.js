import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

import {
  branchConversationMessage,
  cancelApproval as cancelApprovalRequest,
  cancelConversation,
  confirmApproval as confirmApprovalRequest,
  createConversation,
  deleteConversation as deleteConversationRequest,
  getApproval,
  listConversationMessages,
  listConversations,
  regenerateConversationMessage,
  sendBackgroundConversationMessage,
  streamConversationMessage,
  transcribeAudio,
  updateConversation
} from '@/api/chatAi'

const APPROVAL_STORAGE_KEY = 'jumpserver_chat_ai_pending_approvals'

function temporaryId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function serverResults(response) {
  return Array.isArray(response) ? response : response?.results || []
}

function versionedMessages(items, selections) {
  const entries = []
  for (const message of items) {
    const previous = entries.at(-1)
    if (
      message.role === 'assistant' &&
      message.regenerated_from &&
      previous?._versions?.some((version) => version.id === message.regenerated_from)
    ) {
      previous._versions.push(message)
      continue
    }
    if (message.role === 'assistant') entries.push({ _versions: [message] })
    else entries.push(message)
  }

  return entries.map((entry) => {
    if (!entry._versions) return entry
    const versions = entry._versions
    if (versions.length === 1) return versions[0]
    const rootId = versions[0].id
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
    web_search: message.web_search === true,
    regenerated_from: message.regenerated_from || null,
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
      continue
    }
    if (card?.type === 'sources' || card?.source?.type === 'web_search') {
      items.push({
        id: `restored-web-${message.id}-${index}`,
        type: 'web_search',
        status: 'completed',
        data: {
          action: card.source?.action || '',
          sourceCount: card.content?.sources?.length || 0
        },
        timestamp: Date.parse(card.source?.timestamp || '') || 0
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
  const backgroundQueuing = ref(false)
  const preparing = ref(false)
  const transcribing = ref(false)
  const initialized = ref(false)
  const lastError = ref(null)

  let abortController = null
  let temporaryAssistantId = ''
  let activeStreamMessageId = ''
  let stopRequested = false
  let remoteRunPollTimer = null
  let streamConversationId = ''
  let branchPending = false
  let messagesRequestId = 0

  const activeConversation = computed(() => {
    return conversations.value.find((item) => item.id === activeConversationId.value) || null
  })

  const rawVisibleMessages = computed(() => {
    return messages.value.filter((item) => item.role !== 'tool' && item.role !== 'system')
  })

  const visibleMessages = computed(() => {
    return versionedMessages(rawVisibleMessages.value, answerVersionSelections.value)
  })

  const lastMessage = computed(() => rawVisibleMessages.value.at(-1) || null)
  const latestAssistantMessageId = computed(() => {
    return (
      [...rawVisibleMessages.value].reverse().find((item) => item.role === 'assistant')?.id || ''
    )
  })
  const awaitingApproval = computed(() => {
    return approval.value?.status === 'pending' || lastMessage.value?.status === 'awaiting_approval'
  })
  const recoverableRun = computed(() => {
    return !streaming.value && ['pending', 'streaming'].includes(lastMessage.value?.status)
  })
  const busy = computed(() => {
    return (
      streaming.value ||
      stopping.value ||
      approvalProcessing.value ||
      backgroundQueuing.value ||
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
      const response = await listConversations()
      lastError.value = null
      conversations.value = serverResults(response)
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
    const last = lastMessage.value
    if (!conversationId || last?.status !== 'awaiting_approval') return

    const approvalId = readApprovalStorage()[conversationId]
    if (!approvalId) {
      approval.value = {
        id: '',
        status: 'pending',
        recovery: true,
        conversation: conversationId,
        messageId: last.id
      }
      return
    }

    try {
      const data = await getApproval(approvalId)
      if (data.status !== 'pending') {
        forgetApproval(conversationId)
        approval.value = {
          id: '',
          status: 'pending',
          recovery: true,
          conversation: conversationId,
          messageId: last.id
        }
        return
      }
      approval.value = { ...data, messageId: last.id }
    } catch {
      forgetApproval(conversationId)
      approval.value = {
        id: '',
        status: 'pending',
        recovery: true,
        conversation: conversationId,
        messageId: last.id
      }
    }
  }

  function clearRemoteRunPoll() {
    if (remoteRunPollTimer) window.clearTimeout(remoteRunPollTimer)
    remoteRunPollTimer = null
  }

  function scheduleRemoteRunPoll(id) {
    if (activeConversationId.value !== id) return
    clearRemoteRunPoll()
    if (!recoverableRun.value) return
    remoteRunPollTimer = window.setTimeout(async () => {
      remoteRunPollTimer = null
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
    initialized.value = await loadConversations({ selectFirst: true })
  }

  async function selectConversation(id) {
    if (!id || id === activeConversationId.value) return true
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

  function appendResultCard(card) {
    if (!card || typeof card !== 'object') return
    const messageId = activeStreamMessageId || temporaryAssistantId
    const message = messageById(messageId)
    if (!message) return
    message.result_cards.push({ ...card })
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
    }
  }

  function touchLastTrace() {
    const messageId = activeStreamMessageId || temporaryAssistantId
    const item = (traces.value[messageId] || []).at(-1)
    if (item) item.timestamp = Date.now()
  }

  function handleStreamEvent({ event, data }) {
    const assistant = messageById(activeStreamMessageId || temporaryAssistantId)

    switch (event) {
      case 'message_start':
        transferTemporaryMessage(data.message_id)
        break
      case 'message_delta': {
        const target = messageById(activeStreamMessageId || temporaryAssistantId)
        if (target) target.content += data.content || ''
        break
      }
      case 'agent_progress':
        appendTrace('progress', { content: data.content || '' }, 'completed')
        break
      case 'api_search_start':
        appendTrace('api_search', data, 'running')
        break
      case 'api_search_result':
        updateLastTrace('api_search', null, (entry) => ({
          status: 'completed',
          data: { ...entry.data, ...data, operationCount: data.operations?.length || 0 }
        }))
        break
      case 'web_search_start':
        appendTrace('web_search', data, 'running')
        break
      case 'web_search_result':
        updateLastTrace('web_search', null, (entry) => ({
          status: data.ok ? 'completed' : 'failed',
          data: { ...entry.data, ...data, sourceCount: data.sources?.length || 0 }
        }))
        if (data.ok && data.sources?.length) {
          appendResultCard({
            type: 'sources',
            title: data.query || '',
            source: {
              type: 'web_search',
              provider: data.provider || '',
              action: data.action || '',
              timestamp: new Date().toISOString()
            },
            content: { sources: data.sources }
          })
        }
        break
      case 'api_call_start':
        appendTrace('api_call', data, 'running')
        break
      case 'api_call_result':
        updateLastTrace(
          'api_call',
          (entry) => entry.data.operation_id === data.operation_id && entry.status === 'running',
          (entry) => ({
            status: data.ok ? 'completed' : 'failed',
            data: { ...entry.data, ...data }
          })
        )
        break
      case 'approval_required': {
        const messageId = activeStreamMessageId || temporaryAssistantId
        approval.value = {
          ...data,
          id: data.approval_id,
          status: 'pending',
          conversation: activeConversationId.value,
          messageId
        }
        rememberApproval(activeConversationId.value, data.approval_id)
        updateLastTrace(
          'api_call',
          (entry) => entry.data.operation_id === data.operation_id,
          (entry) => ({
            status: 'approval',
            data: { ...entry.data, ...entryData(data) }
          })
        )
        break
      }
      case 'message_done': {
        touchLastTrace()
        const target = messageById(data.message_id) || assistant
        if (target) {
          target.status = data.status
          if (data.usage) {
            target.input_tokens = data.usage.input_tokens || 0
            target.output_tokens = data.usage.output_tokens || 0
          }
        }
        break
      }
      case 'message_error': {
        const target = messageById(data.message_id) || assistant
        if (target) {
          target.status = 'failed'
          target.error = data.detail || data.code
        }
        appendTrace('error', data, 'failed')
        break
      }
      default:
        break
    }
  }

  function entryData(data) {
    return {
      operation_id: data.operation_id,
      method: data.method,
      path: data.path,
      risk_level: data.risk_level,
      preview: data.preview
    }
  }

  async function ensureConversation(content) {
    if (activeConversationId.value) return activeConversation.value
    const conversation = await createConversation()
    conversations.value.unshift(conversation)
    activeConversationId.value = conversation.id
    updateConversationLocally(conversation.id, {
      title: content.trim().replace(/\s+/g, ' ').slice(0, 80),
      date_updated: new Date().toISOString()
    })
    return conversation
  }

  async function sendMessage(rawContent, imageFiles = [], options = {}) {
    const content = String(rawContent || '')
    const images = Array.from(imageFiles || [])
    const files = Array.from(options.files || [])
    const webSearch = options.webSearch === true
    if ((!content.trim() && !images.length && !files.length) || busy.value) return false
    if (options.background === true && (images.length || files.length || !content.trim())) {
      return false
    }

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    const title = content.trim() || files[0]?.name || 'Image'
    let conversation
    preparing.value = true
    try {
      conversation = await ensureConversation(title)
    } catch (error) {
      emitError(error)
      return false
    } finally {
      preparing.value = false
    }
    if (options.background === true) {
      backgroundQueuing.value = true
      try {
        await sendBackgroundConversationMessage(conversation.id, content, {
          webSearch,
          notify: true
        })
        options.onAccepted?.()
        await loadMessages(conversation.id)
        await loadConversations({ silent: true })
        return true
      } catch (error) {
        emitError(error)
        return false
      } finally {
        backgroundQueuing.value = false
      }
    }
    streamConversationId = conversation.id
    const now = new Date().toISOString()
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
      web_search: webSearch,
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
      web_search: webSearch,
      date_created: now
    })
    messages.value.push(userMessage, assistantMessage)
    options.onAccepted?.()
    traces.value[temporaryAssistantId] = []
    streaming.value = true
    abortController = new AbortController()

    updateConversationLocally(conversation.id, {
      title: conversation.title || title.replace(/\s+/g, ' ').slice(0, 80),
      date_updated: now
    })

    try {
      await streamConversationMessage(conversation.id, content, {
        images,
        files,
        webSearch,
        signal: abortController.signal,
        onEvent: handleStreamEvent
      })
      return true
    } catch (error) {
      if (error?.name !== 'AbortError' && !stopRequested) {
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
      if (!stopRequested) {
        await loadMessages(conversation.id, { silent: true })
        await loadConversations({ silent: true })
      }
    }
  }

  async function stopGeneration() {
    if (stopping.value || approvalProcessing.value || backgroundQueuing.value || preparing.value) {
      return
    }
    const conversationId = streamConversationId || (branchPending ? '' : activeConversationId.value)
    stopping.value = true
    stopRequested = true
    abortController?.abort()
    if (!conversationId) {
      stopping.value = false
      stopRequested = false
      return
    }
    try {
      await cancelConversation(conversationId)
    } catch (error) {
      emitError(error)
    } finally {
      forgetApproval(conversationId)
      approval.value = null
      await loadMessages(conversationId)
      await loadConversations({ silent: true })
      stopping.value = false
      stopRequested = false
    }
  }

  async function confirmApproval() {
    if (!approval.value?.id || approvalProcessing.value) return null
    approvalProcessing.value = true
    try {
      const response = await confirmApprovalRequest(approval.value.id)
      forgetApproval(activeConversationId.value)
      approval.value = null
      await loadMessages()
      await loadConversations({ silent: true })
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
    approvalProcessing.value = true
    try {
      await cancelApprovalRequest(approval.value.id)
      forgetApproval(activeConversationId.value)
      approval.value = null
      await loadMessages()
      await loadConversations({ silent: true })
    } catch (error) {
      emitError(error)
      throw error
    } finally {
      approvalProcessing.value = false
    }
  }

  async function transcribe(file, language = '') {
    transcribing.value = true
    try {
      return await transcribeAudio(file, language)
    } catch (error) {
      emitError(error)
      throw error
    } finally {
      transcribing.value = false
    }
  }

  async function branchMessage(messageId, rawContent, options = {}) {
    const sourceConversation = activeConversation.value
    const sourceMessage = messageById(messageId)
    const content = String(rawContent || '')
    const webSearch =
      typeof options.webSearch === 'boolean'
        ? options.webSearch
        : sourceMessage?.web_search === true
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
      web_search: webSearch,
      date_created: now
    })
    temporaryAssistantId = temporaryId('assistant')
    const assistantMessage = normalizeMessage({
      id: temporaryAssistantId,
      role: 'assistant',
      status: 'streaming',
      web_search: webSearch,
      date_created: now
    })
    let branchConversationId = ''
    let branchActivated = false

    function activateBranch(id) {
      if (!id || branchActivated) return
      branchActivated = true
      branchPending = false
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
    branchPending = true
    streamConversationId = ''
    abortController = new AbortController()

    try {
      await branchConversationMessage(sourceConversation.id, messageId, content, {
        webSearch,
        signal: abortController.signal,
        onConversation: activateBranch,
        onEvent: (packet) => {
          if (packet.event === 'message_start') activateBranch(packet.data?.conversation_id)
          handleStreamEvent(packet)
        }
      })
      return true
    } catch (error) {
      if (error?.name !== 'AbortError' && !stopRequested) {
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
      branchPending = false
      streamConversationId = ''
      abortController = null
      temporaryAssistantId = ''
      activeStreamMessageId = ''
      if (branchConversationId && !stopRequested) {
        await loadMessages(branchConversationId, { silent: true })
      }
      await loadConversations({ silent: true })
    }
  }

  async function regenerateMessage(messageId, options = {}) {
    if (!messageId || busy.value) return false
    const conversationId = activeConversationId.value
    if (!conversationId) return false
    const sourceMessage = messageById(messageId)
    const webSearch =
      typeof options.webSearch === 'boolean'
        ? options.webSearch
        : sourceMessage?.web_search === true
    streamConversationId = conversationId

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    temporaryAssistantId = temporaryId('assistant')
    let versionRootId = messageId
    let versionMessage = messageById(versionRootId)
    while (versionMessage?.regenerated_from) {
      versionRootId = versionMessage.regenerated_from
      versionMessage = messageById(versionRootId)
    }
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
        web_search: webSearch,
        regenerated_from: messageId,
        date_created: new Date().toISOString()
      })
    )
    traces.value[temporaryAssistantId] = []
    streaming.value = true
    abortController = new AbortController()

    try {
      await regenerateConversationMessage(conversationId, messageId, {
        webSearch,
        signal: abortController.signal,
        onEvent: handleStreamEvent
      })
      return true
    } catch (error) {
      if (error?.name !== 'AbortError' && !stopRequested) {
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
      if (!stopRequested) {
        await loadMessages(conversationId, { silent: true })
        await loadConversations({ silent: true })
      }
    }
  }

  onBeforeUnmount(() => {
    clearRemoteRunPoll()
    if (abortController) {
      stopRequested = true
      abortController.abort()
    }
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
    backgroundQueuing,
    preparing,
    transcribing,
    initialized,
    lastError,
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
    transcribe,
    branchMessage,
    regenerateMessage
  }
}
