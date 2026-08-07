<template>
  <div class="chat-content">
    <div id="scrollRef" class="chat-list">
      <div v-if="showIntroduction" class="introduction">
        <div
          v-for="(item, index) in introduction"
          :key="index"
          class="introduction-item"
          @click="sendIntroduction(item)"
        >
          <div class="head">
            <i v-if="item.icon" :class="item.icon" />
            <span class="title">{{ item.title }}</span>
          </div>
          <div class="content">
            {{ item.content }}
          </div>
        </div>
      </div>
      <ChatMessage
        v-for="(item, index) in activeChat.chats"
        :key="item?.message?.id || `message-${index}`"
        :item="item"
        :is-terminal="isTerminal"
        :selected-model="selectedModel"
        @insert-code="insertCode"
      />
    </div>
    <div class="input-box">
      <el-button v-show="isLoading" class="stop" round size="small" @click="onStopHandle">
        <i class="fa fa-stop-circle-o" />
        {{ $tc('Stop') }}
      </el-button>
      <ChatInput
        ref="chatInput"
        :expanded="expanded"
        :prompt-options="promptOptions"
        :prompts-loading="promptsLoading"
        :selected-prompt="selectedRoleId"
        @send="onSendHandle"
        @select-prompt="onSelectPromptHandle"
      />
    </div>
  </div>
</template>

<script>
import { KAEL_HOST } from '@/utils/env'
import ChatInput from './ChatInput.vue'
import ChatMessage from './ChatMessage.vue'
import { mapGetters, mapState } from 'vuex'
import { useChat } from '../../useChat.js'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import yaml from 'js-yaml'
import axiosRetry from 'axios-retry'
import request from '@/utils/request'
import { closeWebSocket, createWebSocket, onSend, ws } from '@/utils/request'

const DEFAULT_CHAT_SESSION = '__default__'
const TERMINAL_COMMAND_FORMAT_PROMPT = [
  'When answering in a terminal session, put every executable command in its own fenced Markdown code block.',
  'Always include the correct language tag, such as bash, shell, cmd, or powershell.',
  'Do not place executable commands only in Markdown tables or inline code.',
  'The client uses fenced code blocks to provide Insert and Copy actions.'
].join(' ')

const {
  setLoading,
  clearChats,
  addChatMessageById,
  newChatAndAddMessageById,
  removeLoadingMessageInChat,
  getInputFocus
} = useChat()

export default {
  components: {
    ChatInput,
    ChatMessage
  },
  props: {
    expanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      controller: null,
      selectedRoleId: '',
      chatId: '',
      showIntroduction: false,
      introduction: [],
      requestRunning: false,
      requestDone: true,
      doneReceived: false,
      awaitingSocketDone: false,
      stopVisible: false,
      streamReading: false,
      loadingMessageId: '',
      pendingResponseId: '',
      terminalContext: null,
      isTerminal: false,
      sessionChat: {},
      pendingSessionKey: '',
      conversationSessionMap: {},
      prompts: [],
      promptsLoading: false,
      modelsLoaded: false,
      modelsLoading: false,
      modelsInitialized: false,
      models: [],
      selectedModel: '',
      sessionId: '',
      socket: null,
      tools: [],
      selectedToolIds: [],
      toolsLoaded: false,
      toolServers: [],
      toolServersLoaded: false,
      selectedToolServerIds: [],
      toolsLoading: false
    }
  },
  computed: {
    ...mapState({
      isLoading: (state) => state.chat.loading,
      activeChat: (state) => state.chat.activeChat
    }),
    ...mapGetters(['publicSettings']),
    promptOptions() {
      return this.prompts.map((prompt) => ({
        label: prompt.name,
        value: prompt.roleKey
      }))
    },
    selectedRolePrompt() {
      if (!this.selectedRoleId) return ''
      return this.prompts.find((prompt) => prompt.roleKey === this.selectedRoleId)?.content || ''
    },
    requestPrompt() {
      const prompts = [this.selectedRolePrompt, this.terminalContext?.content].filter(Boolean)
      if (this.isTerminal) {
        prompts.push(TERMINAL_COMMAND_FORMAT_PROMPT)
      }
      return [...new Set(prompts)].join('\n\n')
    },
    toolOptions() {
      return (this.tools || [])
        .map((item) => ({
          label: item?.name || item?.id,
          value: item?.id
        }))
        .filter((item) => !!item.value)
    },
    toolServerOptions() {
      return (this.toolServers || [])
        .map((server) => ({
          label: server?.info?.title || server?.info?.name || server?.url || server?.id,
          value: server?.id
        }))
        .filter((server) => !!server.value)
    }
  },
  beforeUnmount() {
    closeWebSocket()
  },
  methods: {
    replaceLoadingChat(chat) {
      const chats = this.activeChat?.chats || []
      const idx = chats.findIndex(
        (c) =>
          c?.message?.id === this.loadingMessageId ||
          c?.message?.content === 'loading' ||
          c?.message?.is_loading
      )
      if (idx !== -1) {
        chat.message = chat.message || {}
        if (!chat.message.id) {
          chat.message.id = this.loadingMessageId || chat.message.id || this.genId()
        }
        chats[idx] = chat
        this.loadingMessageId = ''
        console.log('[chat] replaceLoadingChat success', { id: chat.message.id, idx })
        return true
      }
      console.log('[chat] replaceLoadingChat miss', { loadingMessageId: this.loadingMessageId })
      return false
    },
    init() {
      // 防止重复初始化时重复插入欢迎消息
      if (!this.activeChat?.chats || this.activeChat.chats.length === 0) {
        this.initChatMessage()
      }
      this.initWebSocket()
      this.fetchPrompts()
    },
    initWebSocket() {
      if (
        this.socket?.readyState === WebSocket.OPEN ||
        this.socket?.readyState === WebSocket.CONNECTING
      ) {
        return
      }

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const endpoint = '/koko/ws/chat/system/'
      createWebSocket(`${protocol}://${window.location.host}${endpoint}`, (data) =>
        this.handleWebSocketMessage(data)
      )
      this.socket = ws || {}
    },
    async fetchPrompts() {
      if (this.promptsLoading || this.prompts.length) return

      this.promptsLoading = true
      try {
        const data = await request.get('/api/v1/settings/chatai-prompts/', {
          disableFlashErrorMsg: true,
          'axios-retry': {
            retries: 2,
            shouldResetTimeout: true,
            retryCondition: (error) => {
              if (axiosRetry.isNetworkError(error)) {
                return true
              }

              const status = error?.response?.status
              return status === 408 || status === 429 || (status >= 500 && status < 600)
            },
            retryDelay: (retryCount) => retryCount * 500
          }
        })
        const prompts = Array.isArray(data) ? data : data?.results || []
        const roleKeys = new Set()
        this.prompts = prompts
          .filter((prompt) => prompt?.name && prompt?.content)
          .map((prompt) => {
            const roleKeyPrefix =
              prompt.id !== undefined && prompt.id !== null && prompt.id !== ''
                ? `id:${prompt.id}`
                : `name:${prompt.name}`
            let roleKey = roleKeyPrefix
            let suffix = 1
            while (roleKeys.has(roleKey)) {
              roleKey = `${roleKeyPrefix}:${suffix}`
              suffix += 1
            }
            roleKeys.add(roleKey)
            return {
              ...prompt,
              roleKey
            }
          })
      } catch (error) {
        console.warn('fetch chat prompts failed', error)
      } finally {
        this.promptsLoading = false
      }
    },
    handleWebSocketMessage(data) {
      if (data.type === 'message') {
        this.onChatMessage(data)
      } else if (data.type === 'error') {
        this.onSystemMessage(data)
      }
    },
    getActiveSessionKey() {
      return this.terminalContext?.sessionId || DEFAULT_CHAT_SESSION
    },
    isActiveSession(sessionKey) {
      return sessionKey === this.getActiveSessionKey()
    },
    getSessionState(sessionKey) {
      const saved = this.sessionChat[sessionKey]
      if (!saved) return null

      if (Array.isArray(saved)) {
        const state = {
          chats: saved,
          chatId: '',
          selectedRoleId: '',
          showIntroduction: false
        }
        this.sessionChat[sessionKey] = state
        return state
      }
      return saved
    },
    ensureSessionState(sessionKey) {
      const saved = this.getSessionState(sessionKey)
      if (saved) return saved

      const state = {
        chats: [],
        chatId: '',
        selectedRoleId: '',
        showIntroduction: false
      }
      this.sessionChat[sessionKey] = state
      return state
    },
    getChatsForSession(sessionKey) {
      if (this.isActiveSession(sessionKey)) {
        return this.activeChat?.chats || []
      }
      return this.ensureSessionState(sessionKey).chats
    },
    removeLoadingFromChats(chats) {
      let index = -1
      for (let i = chats.length - 1; i >= 0; i -= 1) {
        const message = chats[i]?.message
        if (message?.content === 'loading' || message?.is_loading === true) {
          index = i
          break
        }
      }
      if (index !== -1) {
        chats.splice(index, 1)
      }
      this.loadingMessageId = ''
    },
    markInFlightMessages(chats, status) {
      chats.forEach((chat) => {
        if (chat.status === 'thinking' || chat.status === 'streaming') {
          chat.status = status
        }
      })
    },
    addChatToSession(sessionKey, chat) {
      if (this.isActiveSession(sessionKey)) {
        addChatMessageById(chat)
      } else {
        this.ensureSessionState(sessionKey).chats.push(chat)
      }
    },
    setSessionConversationId(sessionKey, conversationId) {
      if (!conversationId) return

      this.conversationSessionMap[conversationId] = sessionKey
      if (this.isActiveSession(sessionKey)) {
        this.chatId = conversationId
      } else {
        this.ensureSessionState(sessionKey).chatId = conversationId
      }
    },
    resolveMessageSession(data) {
      return (
        this.conversationSessionMap[data.id] || this.pendingSessionKey || this.getActiveSessionKey()
      )
    },
    onChatMessage(data) {
      const message = data.message
      if (!data.id || !message) return

      const sessionKey = this.resolveMessageSession(data)
      const chats = this.getChatsForSession(sessionKey)
      const role = message.role || 'assistant'
      const createTime = message.create_time || new Date()
      const status =
        message.type === 'finish' ? 'finished' : message.is_reasoning ? 'thinking' : 'streaming'

      this.removeLoadingFromChats(chats)
      const index = chats.findIndex((item) => item?.message?.id === message.id)
      if (index === -1) {
        if (message.is_reasoning) {
          this.addChatToSession(sessionKey, {
            message: {
              id: message.id,
              role,
              create_time: createTime,
              is_reasoning: true
            },
            reasoning: {
              content: message.content || ''
            },
            result: {
              content: ''
            },
            type: message.type,
            status
          })
        } else {
          this.addChatToSession(sessionKey, {
            message: {
              id: message.id,
              content: message.content || '',
              role,
              create_time: createTime,
              is_reasoning: false
            },
            type: message.type,
            status
          })
        }
      } else {
        const chat = chats[index]
        chat.message = {
          ...chat.message,
          id: message.id,
          role,
          create_time: chat.message?.create_time || createTime,
          is_reasoning: Boolean(chat.reasoning || message.is_reasoning)
        }
        chat.type = message.type
        chat.status = status

        if (message.is_reasoning) {
          chat.reasoning = {
            content: message.content || ''
          }
          chat.result ||= { content: '' }
        } else if (chat.reasoning) {
          chat.result = {
            content: message.content || ''
          }
          chat.message.content = message.content || ''
        } else {
          chat.message.content = message.content || ''
        }

        chats.splice(index, 1, { ...chat })
      }
      this.setSessionConversationId(sessionKey, data.id)

      if (message.type === 'finish') {
        if (this.pendingSessionKey === sessionKey) {
          this.pendingSessionKey = ''
        }
        setLoading(false)
        if (this.isActiveSession(sessionKey)) {
          getInputFocus()
        }
      }
    },
    onSystemMessage(data) {
      const sessionKey = this.resolveMessageSession(data)
      const chats = this.getChatsForSession(sessionKey)
      this.removeLoadingFromChats(chats)
      this.markInFlightMessages(chats, 'error')
      this.addChatToSession(sessionKey, {
        message: {
          id: this.genId(),
          content: data.data || data.system_message || this.$t('ConnectionDropped'),
          role: 'assistant',
          create_time: new Date()
        },
        type: 'error',
        status: 'error'
      })
      if (this.pendingSessionKey === sessionKey) {
        this.pendingSessionKey = ''
      }
      setLoading(false)
    },
    initSocket() {
      if (this.socket) return
      try {
        const wsBase = this.getSocketBase()
        this.socket = io(wsBase, {
          path: '/kael/ws/socket.io',
          transports: ['websocket', 'polling'],
          withCredentials: true
        })
        this.socket.on('connect', () => {
          this.sessionId = this.socket.id
        })
        this.socket.on('events', this.handleSocketEvent)
        this.socket.on('disconnect', () => {
          this.socket = null
        })
      } catch (err) {
        console.warn('socket init error', err)
      }
    },
    genId() {
      return uuidv4()
    },
    startRequest() {
      this.requestRunning = true
      this.doneReceived = false
      this.awaitingSocketDone = false
      this.requestDone = false
      this.stopVisible = true
    },
    endRequest() {
      this.requestRunning = false
      this.requestDone = true
      this.stopVisible = false
    },
    markDone(reason = '') {
      this.doneReceived = true
      this.loadingMessageId = ''
      this.endRequest()
    },
    removeLoadingMessage() {
      if (!this.loadingMessageId) return
      const chats = this.activeChat?.chats || []
      const idx = chats.findIndex((c) => c?.type === 'loading' || c?.message?.is_loading)
      if (idx !== -1) {
        chats.splice(idx, 1)
      }
      this.loadingMessageId = ''
    },
    addLoadingMessage(id) {
      this.loadingMessageId = id
      const loadingChat = {
        message: {
          id,
          content: 'loading',
          role: 'assistant',
          create_time: new Date(),
          is_loading: true
        },
        type: 'loading'
      }
      addChatMessageById(loadingChat)
    },
    initChatMessage({ resetRole = true } = {}) {
      if (resetRole) {
        this.selectedRoleId = ''
      }
      this.showIntroduction = true
      this.chatId = ''
      const chat = {
        message: {
          id: this.genId(),
          content: this.$t('ChatHello'),
          role: 'assistant',
          create_time: new Date()
        },
        status: 'finished'
      }
      newChatAndAddMessageById(chat)
      setLoading(false)
    },
    getActiveProvider() {
      const config = this.publicSettings?.CHAT_AI_PROVIDERS || {}
      const providers = Array.isArray(config)
        ? config
        : Array.isArray(config.providers)
          ? config.providers
          : []
      const defaultName = config.defaultProvider

      const picked =
        providers.find((item) => item.name && item.name === defaultName) ||
        providers.find((item) => item.is_assistant || item.IsAssistant) ||
        providers[0]

      return (
        picked || {
          base_url: KAEL_HOST || '/kael',
          api_key: '',
          model: 'gpt-4o-mini'
        }
      )
    },
    getApiBase(provider) {
      const envBase = KAEL_HOST || ''
      let base = provider?.base_url || envBase || ''

      if (!base) {
        base = '/kael/api'
      }

      if (!base.includes('/kael')) {
        base = `${base.replace(/\/$/, '')}/kael`
      }
      if (!base.includes('/kael/api')) {
        base = `${base.replace(/\/$/, '')}/api`
      }

      return base.replace(/\/$/, '')
    },
    getSocketBase() {
      let base = KAEL_HOST || ''
      if (!base) {
        return window.location.origin
      }
      // 如果包含 /api，去掉 /api 以便 ws 连接
      base = base.replace(/\/api\/?$/, '')
      return base
    },
    getApiBaseV1(provider) {
      const base = this.getApiBase(provider)
      return `${base}/v1`
    },
    buildMessages(userInput, userMessageId) {
      const messages = []
      const history = this.activeChat?.chats || []

      // 只带用户消息，跳过欢迎语和助手历史，保持与 Kael 一致
      history.forEach((chat) => {
        const role = chat?.message?.role
        if (role !== 'user') return
        const content = chat?.message?.content || ''
        if (!content) return
        messages.push({
          role: 'user',
          content,
          ...(chat?.message?.id ? { id: chat.message.id } : {})
        })
      })

      // 当前输入追加一次，避免重复
      const lastUser = messages[messages.length - 1]
      if (!lastUser || lastUser.content !== userInput) {
        messages.push({
          role: 'user',
          content: userInput,
          ...(userMessageId ? { id: userMessageId } : {})
        })
      } else if (userMessageId && !lastUser.id) {
        lastUser.id = userMessageId
      }

      return messages
    },
    findMessageById(id) {
      if (!id) return null
      return (this.activeChat?.chats || []).find((item) => item?.message?.id === id)
    },
    removeMessageById(id) {
      if (!id) return
      const chats = this.activeChat?.chats || []
      const index = chats.findIndex((item) => item?.message?.id === id)
      if (index !== -1) {
        chats.splice(index, 1)
      }
    },
    buildVariables() {
      const now = new Date()
      const pad = (n) => n.toString().padStart(2, '0')
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      const datetimeStr = `${dateStr} ${timeStr}`
      const weekday = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ][now.getDay()]
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      const lang = this.$i18n?.locale || 'en'

      return {
        '{{USER_NAME}}': this.$store?.getters?.user?.name || 'admin',
        '{{USER_LOCATION}}': 'Unknown',
        '{{CURRENT_DATETIME}}': datetimeStr,
        '{{CURRENT_DATE}}': dateStr,
        '{{CURRENT_TIME}}': timeStr,
        '{{CURRENT_WEEKDAY}}': weekday,
        '{{CURRENT_TIMEZONE}}': tz,
        '{{USER_LANGUAGE}}': lang
      }
    },
    buildEndpoint(provider) {
      const baseUrl = this.getApiBase(provider)
      return `${baseUrl}/chat/completions`
    },
    buildAssistantChat(data) {
      const choice = data?.choices?.[0] || {}
      const message = choice?.message || {}
      const content = message?.content || ''
      const reasoning = message?.reasoning_content || ''

      const chat = {
        message: {
          id: message?.id || data?.id || new Date().getTime(),
          content: content || reasoning || '',
          role: message?.role || 'assistant',
          model: message?.model,
          create_time: new Date(),
          is_reasoning: Boolean(reasoning)
        },
        result: {
          content: content
        }
      }

      if (reasoning) {
        chat.reasoning = { content: reasoning }
      }

      const hasContent =
        (chat?.result?.content || '').trim() !== '' ||
        (chat?.reasoning?.content || '').trim() !== ''
      return hasContent ? chat : null
    },
    linkAssistantToLastUser(assistantChat) {
      if (!assistantChat?.message) return assistantChat
      const chats = this.activeChat?.chats || []
      const lastUser = [...chats].reverse().find((item) => item?.message?.role === 'user')
      if (lastUser?.message) {
        const userId = lastUser.message.id || this.genId()
        if (!lastUser.message.id) {
          lastUser.message.id = userId
        }
        if (!Array.isArray(lastUser.message.childrenIds)) {
          lastUser.message.childrenIds = []
        }
        if (!lastUser.message.childrenIds.includes(assistantChat.message.id)) {
          lastUser.message.childrenIds.push(assistantChat.message.id)
        }
        assistantChat.message.parentId = userId
      }
      if (!Array.isArray(assistantChat.message.childrenIds)) {
        assistantChat.message.childrenIds = []
      }
      return assistantChat
    },
    buildCompletedMessages(targetMessageId, modelId, assistantChat) {
      const messageMap = Object.create(null)
      const messages = []
      const chats = this.activeChat?.chats || []
      const now = Date.now()
      const startIndex = chats.findIndex((chat) => chat?.message?.role === 'user')
      if (startIndex === -1) return []

      let parentId = null
      for (let i = startIndex; i < chats.length; i += 1) {
        const chat = chats[i] || {}
        const message = chat.message || {}
        const role = message.role || ''
        if (!role) continue

        const content =
          role === 'assistant'
            ? chat?.result?.content || message.content || ''
            : message.content || ''
        const ts = message.create_time ? new Date(message.create_time).getTime() : now
        const id = message.id || `${role}-${i}-${ts}`
        if (!message.id) {
          message.id = id
        }
        if (message.parentId === undefined || message.parentId === null) {
          message.parentId = parentId
        }
        if (!Array.isArray(message.childrenIds)) {
          message.childrenIds = []
        }

        const item = {
          id,
          role,
          content,
          parentId,
          timestamp: ts,
          childrenIds: [],
          ...(chat?.usage ? { usage: chat.usage } : {}),
          ...(chat?.sources ? { sources: chat.sources } : {})
        }

        const effectiveModel = message?.model || modelId || this.selectedModel || ''
        if (role === 'assistant') {
          item.done = true
          item.role = 'assistant'
          if (effectiveModel) {
            item.model = effectiveModel
            item.modelName = effectiveModel
          }
        } else if (effectiveModel) {
          item.models = [effectiveModel]
          item.role = 'user'
        }

        messageMap[id] = item
        messages.push(item)
        parentId = id

        if (targetMessageId && id === targetMessageId) {
          break
        }
      }

      // 确保助手节点存在，即使未写入 activeChat 也补充进去
      if (assistantChat?.message) {
        const msg = assistantChat.message
        const id = msg.id || this.genId()
        const parentId = msg.parentId || (messages.length ? messages[messages.length - 1].id : null)
        const assistantItem = {
          id,
          role: 'assistant',
          content: msg.content || assistantChat?.result?.content || '',
          parentId,
          timestamp: msg.create_time ? new Date(msg.create_time).getTime() : now,
          childrenIds: [],
          ...(msg.model
            ? { model: msg.model, modelName: msg.model }
            : modelId
              ? { model: modelId, modelName: modelId }
              : {}),
          done: true
        }
        messageMap[id] = assistantItem
        messages.push(assistantItem)
      }

      Object.values(messageMap).forEach((msg) => {
        if (msg.parentId && messageMap[msg.parentId]) {
          messageMap[msg.parentId].childrenIds.push(msg.id)
          const parentChat = chats.find((c) => c?.message?.id === msg.parentId)
          if (parentChat) {
            parentChat.message.childrenIds = parentChat.message.childrenIds || []
            if (!parentChat.message.childrenIds.includes(msg.id)) {
              parentChat.message.childrenIds.push(msg.id)
            }
          }
        }
      })

      // 如果有目标消息，按 parentId 链回溯，保持与 Kael 相同的顺序
      if (targetMessageId && messageMap[targetMessageId]) {
        const chain = []
        let cursor = messageMap[targetMessageId]
        while (cursor) {
          chain.push({ ...cursor, childrenIds: messageMap[cursor.id]?.childrenIds || [] })
          cursor = cursor.parentId ? messageMap[cursor.parentId] : null
        }
        return chain.reverse()
      }

      // 按时间和插入顺序排序，保证 messages 顺序稳定
      const ordered = Object.values(messageMap).sort((a, b) => a.timestamp - b.timestamp)
      // 强制最近一对问答建立 parent/children 关系
      if (ordered.length >= 2) {
        const last = ordered[ordered.length - 1]
        const prev = ordered[ordered.length - 2]
        if (last.role === 'assistant' && prev.role === 'user') {
          last.parentId = prev.id
          prev.childrenIds = prev.childrenIds || []
          if (!prev.childrenIds.includes(last.id)) {
            prev.childrenIds.push(last.id)
          }
        }
      }

      return ordered.map((msg) => ({
        ...msg,
        childrenIds: messageMap[msg.id].childrenIds || msg.childrenIds || []
      }))
    },
    async sendToKael(value, userMessageId, responseId) {
      const userId = userMessageId || this.genId()
      const finalResponseId = responseId || this.genId()
      const provider = this.getActiveProvider()
      const modelId = this.selectedModel || provider.model || 'gpt-4o-mini'
      if (!provider) {
        const chat = {
          message: {
            content: 'Chat provider not configured',
            role: 'assistant',
            create_time: new Date()
          },
          type: 'error'
        }
        if (!this.replaceLoadingChat(chat)) {
          addChatMessageById(chat)
        }
        this.markDone('no provider')
        return
      }

      const endpoint = this.buildEndpoint(provider)

      const headers = {
        'Content-Type': 'application/json'
      }

      if (provider.api_key) {
        headers.Authorization = `Bearer ${provider.api_key}`
      }
      if (this.$i18n?.locale) {
        headers['Accept-Language'] = this.$i18n.locale
      }

      if (!this.modelsLoaded) {
        await this.fetchModels(provider, headers)
      }
      if (!this.toolsLoaded) {
        await this.fetchTools(provider, headers)
      }
      if (!this.toolServersLoaded) {
        await this.ensureToolServers()
      }

      if (!this.chatId) {
        await this.createChat(provider, userId, value, headers)
      }

      const payloadVariables = this.buildVariables()
      const payloadFeatures = {
        image_generation: false,
        code_interpreter: false,
        web_search: false
      }
      const payloadModelItem = {
        id: modelId,
        name: modelId
      }
      const selectedToolIds = Array.isArray(this.selectedToolIds)
        ? this.selectedToolIds.filter(Boolean)
        : []
      const availableToolServers = this.toolServers || []
      const selectedToolServers =
        Array.isArray(this.selectedToolServerIds) && this.selectedToolServerIds.length
          ? availableToolServers.filter((server) => this.selectedToolServerIds.includes(server.id))
          : availableToolServers

      const payload = {
        stream: true,
        model: modelId,
        messages: this.buildMessages(value, userId),
        chat_id: this.chatId || undefined,
        session_id: this.sessionId,
        params: {},
        tool_servers: selectedToolServers,
        ...(selectedToolIds.length ? { tool_ids: selectedToolIds } : {}),
        features: payloadFeatures,
        variables: payloadVariables,
        model_item: payloadModelItem,
        id: finalResponseId,
        response_id: finalResponseId,
        background_tasks: {
          title_generation: true,
          tags_generation: true,
          follow_up_generation: true
        }
      }

      this.controller = new AbortController()
      setLoading(true)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          credentials: 'include',
          signal: this.controller.signal
        })

        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || 'Request failed')
        }

        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('text/event-stream')) {
          await this.handleStreamResponse(response, payload, provider, headers, finalResponseId)
        } else {
          const data = await response.json()

          const assistantChat = this.buildAssistantChat(data)
          if (assistantChat) {
            if (!assistantChat.message.id) {
              assistantChat.message.id = finalResponseId
            }
            assistantChat.message.model = payload.model
            this.linkAssistantToLastUser(assistantChat)
            if (!this.replaceLoadingChat(assistantChat)) {
              this.removeLoadingMessage()
              addChatMessageById(assistantChat)
            }
            this.loadingMessageId = ''
            await this.notifyChatCompleted(provider, headers, assistantChat)
          }
          setLoading(false)
          // 等待 socket completion 再隐藏停止按钮
          this.awaitingSocketDone = true
          getInputFocus()
        }
      } catch (error) {
        console.error(error)
        if (error?.name === 'AbortError') {
          setLoading(false)
          this.markDone('abort')
          return
        }
        setLoading(false)
        const chat = {
          message: {
            content: error?.message || this.$t('ServerBusyRetry'),
            role: 'assistant',
            create_time: new Date()
          },
          type: 'error'
        }
        if (!this.replaceLoadingChat(chat)) {
          addChatMessageById(chat)
        }
        this.markDone('error')
      } finally {
        this.controller = null
      }
    },
    async handleStreamResponse(response, payload, provider, headers, fallbackMessageId) {
      this.streamReading = true
      try {
        const decoder = new TextDecoder('utf-8')
        const reader = response.body.getReader()
        let buffer = ''
        console.log('handleStreamResponse: start')

        const assistantChat = {
          message: {
            id: payload.id || fallbackMessageId || this.genId(),
            content: '',
            role: 'assistant',
            create_time: new Date(),
            model: payload.model || ''
          },
          result: {
            content: ''
          }
        }
        let assistantAdded = false
        let hasContent = false

        const processLine = (line) => {
          if (!line.startsWith('data:')) return
          const jsonStr = line.replace(/^data:\s*/, '')
          if (jsonStr === '[DONE]') {
            this.doneReceived = true
            console.log('[chat] stream DONE received')
            return 'done'
          }
          try {
            const data = JSON.parse(jsonStr)
            const delta = data?.choices?.[0]?.delta?.content || data?.content || ''
            if (delta) {
              if (!assistantAdded) {
                if (!this.replaceLoadingChat(assistantChat)) {
                  this.removeLoadingMessage()
                  addChatMessageById(assistantChat)
                }
                this.loadingMessageId = ''
                assistantAdded = true
              }
              assistantChat.message.content += delta
              assistantChat.result.content += delta
              hasContent = true
            }
            if (data?.id && !assistantChat.message.id) {
              assistantChat.message.id = data.id
            }
          } catch (e) {
            console.warn('parse stream chunk error', e)
          }
          return null
        }

        let done = false
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          console.log('handleStreamResponse: read chunk', {
            readerDone,
            length: value?.length || 0
          })
          if (readerDone) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n')
          buffer = parts.pop() || ''
          for (const part of parts) {
            const status = processLine(part.trim())
            if (status === 'done') {
              done = true
              break
            }
          }
        }

        removeLoadingMessageInChat()
        if (hasContent && assistantAdded) {
          this.linkAssistantToLastUser(assistantChat)
          await this.notifyChatCompleted(provider, headers, assistantChat)
        } else if (!hasContent) {
          this.removeMessageById(assistantChat?.message?.id)
        }
        if (this.doneReceived) {
          setLoading(false)
          this.markDone('stream done')
          getInputFocus()
        } else {
          console.log('[chat] stream finished without DONE', { hasContent, assistantAdded })
        }
      } finally {
        this.streamReading = false
      }
    },
    async handleSocketEvent(event) {
      const { chat_id, message_id, data } = event || {}
      if (chat_id && this.chatId && chat_id !== this.chatId) {
        return
      }
      const type = data?.type || null
      const payload = data?.data || data || {}
      let target = this.findMessageById(message_id)

      const ensureTarget = () => {
        if (target) return target
        const chat = this.buildAssistantChat({}) || {
          message: {
            id: message_id || this.loadingMessageId || this.genId(),
            content: '',
            role: 'assistant',
            create_time: new Date(),
            model: payload?.model || ''
          },
          result: {
            content: ''
          }
        }
        chat.message.id = chat.message.id || message_id || this.loadingMessageId || this.genId()
        chat.message.model = chat.message.model || payload?.model || ''
        if (!this.replaceLoadingChat(chat)) {
          this.removeLoadingMessage()
          addChatMessageById(chat)
        }
        target = chat
        if (this.loadingMessageId && target?.message?.id === this.loadingMessageId) {
          this.loadingMessageId = ''
        }
        return target
      }

      const appendContent = (delta) => {
        const msg = ensureTarget()
        msg.message = msg.message || {
          content: '',
          role: 'assistant',
          id: message_id || this.genId()
        }
        msg.result = msg.result || { content: '' }
        msg.message.content = (msg.message.content || '') + (delta || '')
        msg.result.content = (msg.result.content || '') + (delta || '')
      }

      if ((type === 'chat:message:delta' || type === 'message') && payload?.content) {
        appendContent(payload?.content || '')
      } else if ((type === 'chat:message' || type === 'replace') && payload?.content) {
        const msg = ensureTarget()
        msg.message = msg.message || {
          content: '',
          role: 'assistant',
          id: message_id || this.genId()
        }
        msg.result = msg.result || { content: '' }
        msg.message.content = payload?.content || ''
        msg.result.content = payload?.content || ''
      } else if (type === 'chat:completion') {
        if (payload?.choices?.[0]?.delta?.content) {
          appendContent(payload.choices[0].delta.content)
        }
        if (payload?.content) {
          const msg = ensureTarget()
          msg.message = msg.message || {
            content: '',
            role: 'assistant',
            id: message_id || this.genId()
          }
          msg.result = msg.result || { content: '' }
          msg.message.content = payload.content
          msg.result.content = payload.content
        }

        if (payload?.done === true) {
          this.doneReceived = true
          this.awaitingSocketDone = false
          setLoading(false)
          this.markDone('socket done')
          getInputFocus()
          const provider = this.getActiveProvider()
          if (provider && this.chatId) {
            const headers = {}
            if (provider.api_key) {
              headers.Authorization = `Bearer ${provider.api_key}`
            }
            if (this.$i18n?.locale) {
              headers['Accept-Language'] = this.$i18n.locale
            }
            const assistantChat = this.linkAssistantToLastUser(ensureTarget())
            try {
              await this.notifyChatCompleted(provider, headers, assistantChat)
            } catch (err) {
              console.warn('socket chat completed notify error', err)
            }
          }
        }
      } else if (type === 'chat:message:error') {
        const msg = ensureTarget()
        msg.message.content = payload?.error?.content || ''
        removeLoadingMessageInChat()
        setLoading(false)
        this.awaitingSocketDone = false
        this.markDone('socket error')
      }
    },
    async fetchModels(provider, headers = {}) {
      try {
        this.modelsLoading = true
        const baseUrl = this.getApiBase(provider)
        const res = await fetch(`${baseUrl}/models`, {
          method: 'GET',
          headers,
          credentials: 'include'
        })
        if (!res.ok) {
          // 不阻塞后续请求，但记录错误
          console.warn('fetch models failed', res.status)
        } else {
          const data = await res.json()
          this.models = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
          this.ensureSelectedModel(provider)
          this.modelsLoaded = true
        }
      } catch (err) {
        console.warn('fetch models error', err)
        this.ensureSelectedModel(provider)
      } finally {
        this.modelsLoading = false
      }
    },
    ensureSelectedModel(provider) {
      const defaultModel = provider?.model
      if (defaultModel && !this.models.some((model) => model?.id === defaultModel)) {
        this.models = [...this.models, { id: defaultModel, name: defaultModel }]
      }
      if (!this.selectedModel) {
        this.selectedModel = defaultModel || this.models[0]?.id || ''
      }
    },
    async ensureModels() {
      const provider = this.getActiveProvider()
      if (!provider) return
      const headers = {}
      if (provider.api_key) {
        headers.Authorization = `Bearer ${provider.api_key}`
      }
      await this.fetchModels(provider, headers)
    },
    async fetchTools(provider, headers = {}) {
      try {
        this.toolsLoading = true
        const baseUrl = this.getApiBase(provider)
        const res = await fetch(`${baseUrl}/v1/tools/`, {
          method: 'GET',
          headers,
          credentials: 'include'
        })
        if (!res.ok) {
          console.warn('fetch tools failed', res.status)
          this.toolsLoaded = true
          return
        }
        const data = await res.json()
        if (Array.isArray(data)) {
          this.tools = data
          // keep any existing selections, but don't auto-enable new tools by default
          if (this.selectedToolIds.length) {
            const validIds = data.map((item) => item?.id)
            this.selectedToolIds = this.selectedToolIds.filter((id) => validIds.includes(id))
          }
        }
      } catch (err) {
        console.warn('fetch tools error', err)
      } finally {
        this.toolsLoaded = true
        this.toolsLoading = false
      }
    },
    async ensureTools() {
      const provider = this.getActiveProvider()
      if (!provider) return
      const headers = {}
      if (provider.api_key) {
        headers.Authorization = `Bearer ${provider.api_key}`
      }
      await this.fetchTools(provider, headers)
    },
    async ensureToolServers() {
      try {
        const servers = this.getStoredToolServers()
        if (!servers.length) {
          this.toolServers = []
          return
        }
        const loaded = await this.loadToolServers(servers)
        this.toolServers = loaded
        if (!this.selectedToolServerIds.length) {
          this.selectedToolServerIds = loaded.map((item) => item.id)
        } else {
          const validIds = loaded.map((item) => item.id)
          this.selectedToolServerIds = this.selectedToolServerIds.filter((id) =>
            validIds.includes(id)
          )
        }
      } catch (err) {
        console.warn('load tool servers error', err)
        this.toolServers = []
      } finally {
        this.toolServersLoaded = true
      }
    },
    getStoredToolServers() {
      const baseKey = 'kael:user-settings'
      const userName = (this.$store?.getters?.user?.name || '').trim()
      const keys = userName ? [`${baseKey}:${userName}`, baseKey] : [baseKey]
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key)
          if (!raw) continue
          const parsed = JSON.parse(raw)
          const servers = parsed?.ui?.toolServers
          if (Array.isArray(servers)) {
            return servers
          }
        } catch (err) {
          console.warn('parse stored tool servers error', err)
        }
      }
      return []
    },
    async loadToolServers(servers) {
      const tasks = []
      servers.forEach((server, idx) => {
        if (server?.config?.enable && (server.type || 'openapi') === 'openapi') {
          tasks.push(this.fetchToolServer(server, idx))
        }
      })
      const results = await Promise.all(tasks)
      return results.filter(Boolean)
    },
    async fetchToolServer(server, idx) {
      try {
        const authType = server?.auth_type || 'bearer'
        const headers = {
          Accept: 'application/json'
        }
        if (authType === 'bearer' && server?.key) {
          headers.Authorization = `Bearer ${server.key}`
        } else if (authType === 'session' && localStorage.token) {
          headers.Authorization = `Bearer ${localStorage.token}`
        }

        const specType = server?.spec_type || 'url'
        let spec = null
        if (specType === 'url') {
          const path = server?.path || 'openapi.json'
          const url = path.includes('://')
            ? path
            : `${server?.url || ''}${path.startsWith('/') ? '' : '/'}${path}`
          const res = await fetch(url, {
            method: 'GET',
            headers,
            credentials: authType === 'session' ? 'include' : 'omit'
          })
          if (!res.ok) {
            console.warn('fetch tool server spec failed', res.status)
            return null
          }
          const contentType = res.headers.get('content-type') || ''
          if (contentType.includes('json')) {
            spec = await res.json()
          } else {
            const text = await res.text()
            try {
              spec = JSON.parse(text)
            } catch (e) {
              spec = yaml.load(text)
            }
          }
        } else if (specType === 'json' && server?.spec) {
          try {
            spec = JSON.parse(server.spec)
          } catch (err) {
            console.warn('parse inline tool server spec error', err)
            return null
          }
        }

        if (!spec) return null

        const openapi = spec
        const specs = this.convertOpenApiToToolPayload(openapi)
        const info = openapi?.info || server?.info || {}
        const id = info?.id || String(idx)
        return {
          id: String(id),
          idx,
          url: server?.url,
          openapi,
          info,
          specs
        }
      } catch (err) {
        console.warn('fetch tool server error', err)
        return null
      }
    },
    resolveSchema(schemaRef, components) {
      if (!schemaRef) return {}
      if (!schemaRef.$ref && schemaRef.type === 'object') {
        const schemaObj = {
          type: 'object',
          properties: {},
          required: schemaRef.required || []
        }
        for (const [propName, propSchema] of Object.entries(schemaRef.properties || {})) {
          schemaObj.properties[propName] = this.resolveSchema(propSchema, components)
        }
        return schemaObj
      }

      if (!schemaRef.$ref && schemaRef.type === 'array') {
        return {
          type: 'array',
          items: this.resolveSchema(schemaRef.items, components)
        }
      }

      if (!schemaRef.$ref && schemaRef.type) {
        return {
          type: schemaRef.type,
          ...(schemaRef.description ? { description: schemaRef.description } : {})
        }
      }

      if (schemaRef.$ref) {
        const refPath = schemaRef.$ref.replace('#/components/schemas/', '')
        const refSchema = components?.schemas?.[refPath]
        if (!refSchema) return {}
        const schemaObj = {
          type: refSchema.type || 'object',
          properties: {},
          required: refSchema.required || []
        }
        if (refSchema.type === 'object') {
          for (const [propName, propSchema] of Object.entries(refSchema.properties || {})) {
            schemaObj.properties[propName] = this.resolveSchema(propSchema, components)
          }
        } else if (refSchema.type === 'array') {
          schemaObj.items = this.resolveSchema(refSchema.items, components)
        }
        return schemaObj
      }

      return {}
    },
    convertOpenApiToToolPayload(openApiSpec) {
      if (!openApiSpec?.paths) return []
      const toolPayload = []
      for (const [, methods] of Object.entries(openApiSpec.paths)) {
        for (const [, operation] of Object.entries(methods)) {
          if (operation?.operationId) {
            const tool = {
              name: operation.operationId,
              description:
                operation.description || operation.summary || 'No description available.',
              parameters: {
                type: 'object',
                properties: {},
                required: []
              }
            }

            if (operation.parameters) {
              operation.parameters.forEach((param) => {
                const paramSchema = param.schema || {}
                let description = paramSchema.description || param.description || ''
                if (Array.isArray(paramSchema.enum)) {
                  description += `. Possible values: ${paramSchema.enum.join(', ')}`
                }
                tool.parameters.properties[param.name] = {
                  type: paramSchema.type,
                  ...(description ? { description } : {})
                }
                if (param.required) {
                  tool.parameters.required.push(param.name)
                }
              })
            }

            if (operation.requestBody) {
              const content = operation.requestBody.content
              if (content && content['application/json']) {
                const requestSchema = content['application/json'].schema
                const resolved = this.resolveSchema(requestSchema, openApiSpec.components)
                if (resolved.properties) {
                  tool.parameters.properties = {
                    ...tool.parameters.properties,
                    ...resolved.properties
                  }
                }
                if (resolved.required) {
                  tool.parameters.required = [
                    ...new Set([...tool.parameters.required, ...(resolved.required || [])])
                  ]
                }
                if (resolved.type === 'array') {
                  tool.parameters = resolved
                }
              }
            }

            toolPayload.push(tool)
          }
        }
      }

      return toolPayload
    },
    async createChat(provider, messageId, content, headers = {}) {
      try {
        const models = [provider.model || 'gpt-4o-mini']
        const newMessage = {
          childrenIds: [],
          content: content,
          id: messageId,
          models: models,
          parentId: null,
          role: 'user',
          timestamp: Date.now()
        }
        const history = {
          messages: {
            [messageId]: newMessage
          },
          currentId: messageId
        }
        const baseUrlV1 = this.getApiBaseV1(provider)
        const res = await fetch(`${baseUrlV1}/chats/new`, {
          method: 'POST',
          headers: {
            ...headers,
            sid: this.sessionId
          },
          credentials: 'include',
          body: JSON.stringify({
            chat: {
              id: '',
              title: this.$t('NewChat'),
              models: models,
              params: {},
              history,
              messages: [newMessage],
              tags: [],
              timestamp: Date.now()
            },
            folder_id: null
          })
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.id) {
            this.chatId = data.id
          }
        } else {
          console.warn('create chat failed', res.status)
        }
      } catch (err) {
        console.warn('create chat error', err)
      }
    },
    async notifyChatCompleted(provider, headers = {}, assistantChat) {
      try {
        if (!this.chatId) return
        const baseUrl = this.getApiBase(provider)
        const reqHeaders = {
          'Content-Type': 'application/json',
          ...headers
        }
        const modelId = assistantChat?.message?.model || provider.model || 'gpt-4o-mini'
        const modelItem = this.models.find((m) => m.id === modelId) || { id: modelId }
        const messages = this.buildCompletedMessages(
          assistantChat?.message?.id,
          modelId,
          assistantChat
        )
        // 确保至少包含一问一答
        if (!messages.find((m) => m.role === 'assistant') && assistantChat?.message) {
          const assistId = assistantChat.message.id || this.genId()
          const parentUser = messages.findLast
            ? messages.findLast((m) => m.role === 'user')
            : [...messages].reverse().find((m) => m.role === 'user')
          const parentId = parentUser?.id || null
          messages.push({
            id: assistId,
            role: 'assistant',
            parentId,
            childrenIds: [],
            content: assistantChat.message.content || assistantChat?.result?.content || '',
            timestamp: assistantChat.message.create_time
              ? new Date(assistantChat.message.create_time).getTime()
              : Date.now(),
            done: true,
            model: modelId,
            modelName: modelId
          })
          if (parentId) {
            parentUser.childrenIds = parentUser.childrenIds || []
            if (!parentUser.childrenIds.includes(assistId)) {
              parentUser.childrenIds.push(assistId)
            }
          }
        }
        const body = {
          model: modelId,
          messages,
          model_item: modelItem,
          chat_id: this.chatId,
          session_id: this.sessionId,
          id: assistantChat?.message?.id || ''
        }

        await fetch(`${baseUrl}/chat/completed`, {
          method: 'POST',
          headers: reqHeaders,
          credentials: 'include',
          body: JSON.stringify(body)
        })
        await this.saveChatSnapshot(provider, reqHeaders, messages, modelId)
      } catch (err) {
        console.warn('chat completed notify error', err)
      }
    },
    async saveChatSnapshot(provider, headers, messages, modelId) {
      try {
        if (!this.chatId) return
        const baseUrlV1 = this.getApiBaseV1(provider)
        const historyMessages = {}
        messages.forEach((msg) => {
          historyMessages[msg.id] = { ...msg }
        })
        const currentId = messages[messages.length - 1]?.id || null
        const body = {
          chat: {
            models: [modelId],
            messages,
            history: {
              messages: historyMessages,
              currentId
            },
            params: {},
            files: []
          }
        }
        await fetch(`${baseUrlV1}/chats/${this.chatId}`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(body)
        })
      } catch (err) {
        console.warn('save chat snapshot error', err)
      }
    },
    onTerminalContext(terminalContext) {
      const originSessionKey = this.getActiveSessionKey()
      const newSessionKey = terminalContext.sessionId || DEFAULT_CHAT_SESSION
      const sessionChanged = originSessionKey !== newSessionKey

      if (sessionChanged) {
        this.saveSessionChat(originSessionKey)
      }
      this.terminalContext = terminalContext
      this.isTerminal = true
      this.sessionId = terminalContext.sessionId || ''

      if (!sessionChanged) {
        return
      }

      const saved = this.getSessionState(newSessionKey)
      if (saved) {
        this.restoreSessionChat(newSessionKey)
      } else {
        this.initChatMessage()
      }
    },
    saveSessionChat(sessionKey) {
      if (!sessionKey) return

      this.sessionChat[sessionKey] = {
        chats: JSON.parse(JSON.stringify(this.activeChat?.chats || [])),
        chatId: this.chatId,
        selectedRoleId: this.selectedRoleId,
        showIntroduction: this.showIntroduction
      }
      if (this.chatId) {
        this.conversationSessionMap[this.chatId] = sessionKey
      }
    },
    restoreSessionChat(sessionKey) {
      const saved = this.getSessionState(sessionKey)
      if (!saved) return

      clearChats()
      for (const chat of saved.chats || []) {
        addChatMessageById(JSON.parse(JSON.stringify(chat)))
      }
      this.chatId = saved.chatId || ''
      this.selectedRoleId = saved.selectedRoleId || ''
      this.showIntroduction = Boolean(saved.showIntroduction)
      if (this.chatId) {
        this.conversationSessionMap[this.chatId] = sessionKey
      }
    },
    onSendHandle(value) {
      this.showIntroduction = false
      this.socket = ws || {}
      if (ws?.readyState !== WebSocket.OPEN) {
        this.onSystemMessage({})
        this.initWebSocket()
        return
      }

      addChatMessageById({
        message: {
          id: this.genId(),
          content: value,
          role: 'user',
          create_time: new Date()
        }
      })
      const sessionKey = this.getActiveSessionKey()
      this.pendingSessionKey = sessionKey
      if (this.chatId) {
        this.conversationSessionMap[this.chatId] = sessionKey
      }
      onSend({
        data: value,
        prompt: this.requestPrompt,
        id: this.chatId || ''
      })
      this.addLoadingMessage(this.genId())
    },
    onSelectPromptHandle(value) {
      this.selectedRoleId = value || ''
      this.chatId = ''
    },
    onNewChat() {
      clearChats()
      this.initChatMessage()
    },
    onStopHandle() {
      const sessionKey = this.pendingSessionKey || this.getActiveSessionKey()
      const sessionState = this.getSessionState(sessionKey)
      const conversationId = this.isActiveSession(sessionKey)
        ? this.chatId
        : sessionState?.chatId || ''
      if (ws?.readyState === WebSocket.OPEN) {
        onSend({ id: conversationId, interrupt: true })
      }
      const chats = this.getChatsForSession(sessionKey)
      this.removeLoadingFromChats(chats)
      this.markInFlightMessages(chats, 'interrupted')
      this.pendingSessionKey = ''
      setLoading(false)
    },
    sendIntroduction(item) {
      this.showIntroduction = false
      this.onSendHandle(item.content)
    },
    insertCode(code) {
      this.sendPostMessage({
        name: 'INSERT_TERMINAL_CODE',
        data: code.replace(/^[\s\r\n]+|[\s\r\n]+$/g, '')
      })
    },
    onSelectTools(ids) {
      this.selectedToolIds = Array.isArray(ids) ? ids : []
    },
    onSelectToolServers(ids) {
      this.selectedToolServerIds = Array.isArray(ids) ? ids : []
    },
    sendPostMessage(data) {
      window.parent.postMessage(data)
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;

  .introduction {
    padding: 16px 14px 0;

    .introduction-item {
      padding: 12px 14px;
      border-radius: 8px;
      margin-top: 16px;
      background-color: var(--menu-hover);
      cursor: pointer;

      &:hover {
        box-shadow: 0 0 2px 2px #00000014;
      }

      &:first-child {
        margin-top: 0;
      }

      .head {
        margin-bottom: 2px;

        .title {
          font-weight: 500;
          color: #373739;
        }
      }

      .content {
        display: inline-block;
        color: #a7a7ab;
        word-wrap: break-word;
      }
    }
  }

  .chat-list {
    flex: 1;
    position: relative;
    padding: 0 15px 25px;
    overflow-y: auto;
    user-select: text;

    &::-webkit-scrollbar {
      width: 12px;
    }
  }

  .input-box {
    position: relative;
    //height: 60px;
    padding: 0 15px;
    margin-bottom: 15px;
    //border-top: 1px solid #ececec;
  }

  .stop {
    position: absolute;
    top: -37px;
    left: 50%;
    z-index: 11;
    min-height: 28px;
    height: 28px;
    padding: 0 12px;
    border-color: transparent;
    border-radius: 14px;
    background-color: #f7f7f8;
    box-shadow: none;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.45);
    transform: translateX(-50%);

    &:hover,
    &:focus,
    &:active {
      border-color: transparent;
      background-color: #f7f7f8;
      color: rgba(0, 0, 0, 0.45);
    }

    :deep(i) {
      margin-right: 4px;
    }
  }
}
</style>
