import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

import {
  branchConversationMessage,
  cancelApproval as cancelApprovalRequest,
  cancelConversation,
  confirmApproval as confirmApprovalRequest,
  createConversation,
  deleteConversation as deleteConversationRequest,
  getApproval,
  listAssistants,
  listConversationMessages,
  listConversations,
  regenerateConversationMessage,
  sendBackgroundConversationMessage,
  streamConversationMessage,
  transcribeAudio,
  updateConversation
} from '@/api/chatAi'

const APPROVAL_STORAGE_KEY = 'jumpserver_chat_ai_pending_approvals'
const DEFAULT_ASSISTANT = {
  key: 'general',
  name: 'JumpServer assistant',
  description: '',
  starter_prompts: []
}

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
    regenerated_from: message.regenerated_from || null,
    date_created: message.date_created || new Date().toISOString()
  }
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
  const assistants = ref([DEFAULT_ASSISTANT])
  const selectedAssistantKey = ref(DEFAULT_ASSISTANT.key)
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

  const activeConversation = computed(() => {
    return conversations.value.find((item) => item.id === activeConversationId.value) || null
  })

  const currentAssistant = computed(() => {
    return (
      assistants.value.find((item) => item.key === selectedAssistantKey.value) ||
      assistants.value[0] ||
      DEFAULT_ASSISTANT
    )
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

  async function loadConversations({ selectFirst = false } = {}) {
    loadingConversations.value = true
    try {
      const response = await listConversations()
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
    } catch (error) {
      emitError(error)
    } finally {
      loadingConversations.value = false
    }
  }

  async function loadAssistants() {
    try {
      const response = await listAssistants()
      const items = serverResults(response)
      assistants.value = items.length ? items : [DEFAULT_ASSISTANT]
    } catch {
      assistants.value = [DEFAULT_ASSISTANT]
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
    if (!id) {
      clearRemoteRunPoll()
      revokeLocalAttachments(messages.value)
      messages.value = []
      approval.value = null
      return
    }
    if (!silent) loadingMessages.value = true
    try {
      const data = await listConversationMessages(id)
      if (activeConversationId.value !== id) return
      revokeLocalAttachments(messages.value)
      messages.value = data.map(normalizeMessage)
      await restoreApproval()
    } catch (error) {
      if (!silent) emitError(error)
    } finally {
      if (!silent) loadingMessages.value = false
      scheduleRemoteRunPoll(id)
    }
  }

  async function initialize() {
    if (initialized.value) return
    initialized.value = true
    await loadAssistants()
    await loadConversations({ selectFirst: true })
  }

  async function selectConversation(id) {
    if (!id || id === activeConversationId.value) return true
    if (streaming.value || stopping.value || approvalProcessing.value) return false
    clearRemoteRunPoll()
    const conversation = conversations.value.find((item) => item.id === id)
    selectedAssistantKey.value = conversation?.assistant || DEFAULT_ASSISTANT.key
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
    if (streaming.value || stopping.value || approvalProcessing.value) return false
    clearRemoteRunPoll()
    activeConversationId.value = ''
    revokeLocalAttachments(messages.value)
    messages.value = []
    approval.value = null
    lastError.value = null
    return true
  }

  async function selectAssistant(key) {
    if (!key || key === selectedAssistantKey.value) return true
    if (busy.value || !assistants.value.some((item) => item.key === key)) return false
    selectedAssistantKey.value = key
    if (!activeConversationId.value) return true
    try {
      const conversation = await updateConversation(activeConversationId.value, { assistant: key })
      updateConversationLocally(conversation.id, conversation)
      return true
    } catch (error) {
      selectedAssistantKey.value = activeConversation.value?.assistant || DEFAULT_ASSISTANT.key
      emitError(error)
      return false
    }
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
    if (item) Object.assign(item, changes)
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
      case 'agent_plan':
        appendTrace('agent_plan', data, 'completed')
        break
      case 'api_search_start':
        appendTrace('api_search', data, 'running')
        break
      case 'api_search_result':
        updateLastTrace('api_search', null, {
          status: 'completed',
          data: { ...data, operationCount: data.operations?.length || 0 }
        })
        break
      case 'web_search_start':
        appendTrace('web_search', data, 'running')
        break
      case 'web_search_result':
        updateLastTrace('web_search', null, {
          status: data.ok ? 'completed' : 'failed',
          data: { ...data, sourceCount: data.sources?.length || 0 }
        })
        if (data.ok && data.sources?.length) {
          appendResultCard({
            type: 'sources',
            title: data.query || '',
            source: { type: 'web_search', provider: data.provider || '' },
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
          { status: data.ok ? 'completed' : 'failed', data: { ...data } }
        )
        appendResultCard(data.presentation)
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
        updateLastTrace('api_call', (entry) => entry.data.operation_id === data.operation_id, {
          status: 'approval',
          data: { ...entryData(data) }
        })
        break
      }
      case 'message_done': {
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
    const conversation = await createConversation({ assistant: selectedAssistantKey.value })
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
    if ((!content.trim() && !images.length && !files.length) || busy.value) return false
    if (options.background === true && (images.length || files.length || !content.trim())) {
      return false
    }

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    const title = content.trim() || files[0]?.name || 'Image'
    const conversation = await ensureConversation(title)
    if (options.background === true) {
      backgroundQueuing.value = true
      try {
        await sendBackgroundConversationMessage(conversation.id, content, {
          webSearch: options.webSearch === true,
          notify: true
        })
        await loadMessages(conversation.id)
        await loadConversations()
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
    abortController = new AbortController()

    updateConversationLocally(conversation.id, {
      title: conversation.title || title.replace(/\s+/g, ' ').slice(0, 80),
      date_updated: now
    })

    try {
      await streamConversationMessage(conversation.id, content, {
        images,
        files,
        webSearch: options.webSearch === true,
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
        await loadMessages(conversation.id)
        await loadConversations()
      }
    }
  }

  async function stopGeneration() {
    if (stopping.value) return
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
      await loadConversations()
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
      await loadConversations()
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
      await loadConversations()
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
        webSearch: options.webSearch === true,
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
        await loadMessages(branchConversationId)
      }
      await loadConversations()
    }
  }

  async function regenerateMessage(messageId, options = {}) {
    if (!messageId || busy.value) return false
    const conversationId = activeConversationId.value
    if (!conversationId) return false
    streamConversationId = conversationId

    lastError.value = null
    stopRequested = false
    clearRemoteRunPoll()
    temporaryAssistantId = temporaryId('assistant')
    activeStreamMessageId = ''
    messages.value.push(
      normalizeMessage({
        id: temporaryAssistantId,
        role: 'assistant',
        status: 'streaming',
        regenerated_from: messageId,
        date_created: new Date().toISOString()
      })
    )
    traces.value[temporaryAssistantId] = []
    streaming.value = true
    abortController = new AbortController()

    try {
      await regenerateConversationMessage(conversationId, messageId, {
        webSearch: options.webSearch === true,
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
        await loadMessages(conversationId)
        await loadConversations()
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
    assistants,
    currentAssistant,
    selectedAssistantKey,
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
    transcribing,
    initialized,
    lastError,
    awaitingApproval,
    recoverableRun,
    busy,
    initialize,
    loadConversations,
    loadAssistants,
    loadMessages,
    selectConversation,
    newConversation,
    selectAssistant,
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
