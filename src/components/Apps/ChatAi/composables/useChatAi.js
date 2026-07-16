import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

import {
  cancelApproval as cancelApprovalRequest,
  cancelConversation,
  confirmApproval as confirmApprovalRequest,
  createConversation,
  deleteConversation as deleteConversationRequest,
  getApproval,
  listConversationMessages,
  listConversations,
  streamConversationMessage,
  transcribeAudio,
  updateConversation
} from '@/api/chatAi'
import { withBaseApi } from '@/utils/env'

const APPROVAL_STORAGE_KEY = 'jumpserver_chat_ai_pending_approvals'

function temporaryId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function serverResults(response) {
  return Array.isArray(response) ? response : response?.results || []
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
    date_created: message.date_created || new Date().toISOString()
  }
}

function revokeLocalImages(items) {
  for (const item of items || []) {
    for (const image of item.images || []) {
      if (image.local && image.url) URL.revokeObjectURL(image.url)
    }
  }
}

export function useChatAi(options = {}) {
  const conversations = ref([])
  const activeConversationId = ref('')
  const messages = ref([])
  const traces = ref({})
  const approval = ref(null)
  const loadingConversations = ref(false)
  const loadingMessages = ref(false)
  const streaming = ref(false)
  const stopping = ref(false)
  const approvalProcessing = ref(false)
  const transcribing = ref(false)
  const initialized = ref(false)
  const lastError = ref(null)

  let abortController = null
  let temporaryAssistantId = ''
  let activeStreamMessageId = ''
  let stopRequested = false

  const activeConversation = computed(() => {
    return conversations.value.find((item) => item.id === activeConversationId.value) || null
  })

  const visibleMessages = computed(() => {
    return messages.value.filter((item) => item.role !== 'tool' && item.role !== 'system')
  })

  const lastMessage = computed(() => visibleMessages.value.at(-1) || null)
  const awaitingApproval = computed(() => {
    return approval.value?.status === 'pending' || lastMessage.value?.status === 'awaiting_approval'
  })
  const recoverableRun = computed(() => {
    return !streaming.value && lastMessage.value?.status === 'streaming'
  })
  const busy = computed(() => {
    return (
      streaming.value ||
      stopping.value ||
      approvalProcessing.value ||
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

  async function loadMessages(id = activeConversationId.value) {
    if (!id) {
      revokeLocalImages(messages.value)
      messages.value = []
      approval.value = null
      return
    }
    loadingMessages.value = true
    try {
      const data = await listConversationMessages(id)
      if (activeConversationId.value !== id) return
      revokeLocalImages(messages.value)
      messages.value = data.map(normalizeMessage)
      await restoreApproval()
    } catch (error) {
      emitError(error)
    } finally {
      loadingMessages.value = false
    }
  }

  async function initialize() {
    if (initialized.value) return
    initialized.value = true
    await loadConversations({ selectFirst: true })
  }

  async function selectConversation(id) {
    if (!id || id === activeConversationId.value) return true
    if (streaming.value || stopping.value || approvalProcessing.value) return false
    activeConversationId.value = id
    revokeLocalImages(messages.value)
    messages.value = []
    approval.value = null
    lastError.value = null
    await loadMessages(id)
    await nextTick()
    return true
  }

  function newConversation() {
    if (streaming.value || stopping.value || approvalProcessing.value) return false
    activeConversationId.value = ''
    revokeLocalImages(messages.value)
    messages.value = []
    approval.value = null
    lastError.value = null
    return true
  }

  async function removeConversation(id) {
    await deleteConversationRequest(id)
    forgetApproval(id)
    const wasActive = activeConversationId.value === id
    conversations.value = conversations.value.filter((item) => item.id !== id)
    if (wasActive) {
      activeConversationId.value = ''
      revokeLocalImages(messages.value)
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
      case 'api_call_start':
        appendTrace('api_call', data, 'running')
        break
      case 'api_call_result':
        updateLastTrace(
          'api_call',
          (entry) => entry.data.operation_id === data.operation_id && entry.status === 'running',
          { status: data.ok ? 'completed' : 'failed', data: { ...data } }
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
    const conversation = await createConversation()
    conversations.value.unshift(conversation)
    activeConversationId.value = conversation.id
    updateConversationLocally(conversation.id, {
      title: content.trim().replace(/\s+/g, ' ').slice(0, 80),
      date_updated: new Date().toISOString()
    })
    return conversation
  }

  async function sendMessage(rawContent, imageFiles = []) {
    const content = String(rawContent || '')
    const images = Array.from(imageFiles || [])
    if ((!content.trim() && !images.length) || busy.value) return false

    lastError.value = null
    stopRequested = false
    const title = content.trim() || 'Image'
    const conversation = await ensureConversation(title)
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
      temporaryAssistantId = ''
      activeStreamMessageId = ''
      if (!stopRequested) {
        await loadMessages(conversation.id)
        await loadConversations()
      }
    }
  }

  async function stopGeneration() {
    const conversationId = activeConversationId.value
    if (!conversationId || stopping.value) return
    stopping.value = true
    stopRequested = true
    abortController?.abort()
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

  async function retryLastMessage() {
    const lastUserMessage = [...messages.value].reverse().find((item) => item.role === 'user')
    if (!lastUserMessage) return false
    try {
      const images = await Promise.all(
        (lastUserMessage.images || []).map(async (image) => {
          if (image.file) return image.file
          const response = await fetch(withBaseApi(image.url), { credentials: 'include' })
          if (!response.ok) throw new Error('Unable to reload the attached image.')
          return new File([await response.blob()], image.name, { type: image.content_type })
        })
      )
      return sendMessage(lastUserMessage.content, images)
    } catch (error) {
      emitError(error)
      return false
    }
  }

  onBeforeUnmount(() => {
    if (abortController) {
      stopRequested = true
      abortController.abort()
    }
    revokeLocalImages(messages.value)
  })

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    visibleMessages,
    traces,
    approval,
    loadingConversations,
    loadingMessages,
    streaming,
    stopping,
    approvalProcessing,
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
    removeConversation,
    renameConversation,
    sendMessage,
    stopGeneration,
    confirmApproval,
    rejectApproval,
    transcribe,
    retryLastMessage
  }
}
