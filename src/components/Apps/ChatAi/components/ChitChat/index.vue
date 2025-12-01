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
        :key="index"
        :item="item"
        :is-terminal="isTerminal"
        :selected-model="selectedModel"
        @insert-code="insertCode"
      />
    </div>
    <div class="input-box">
      <el-button
        v-if="isLoading && controller"
        class="stop"
        icon="fa fa-stop-circle-o"
        round
        size="small"
        @click="onStopHandle"
      >{{ $tc('Stop') }}
      </el-button>
      <ChatInput
        ref="chatInput"
        :expanded="expanded"
        :model-options="models"
        :selected-model="selectedModel"
        :loading="modelsLoading"
        @send="onSendHandle"
        @select-model="onSelectModel"
      />
    </div>
  </div>
</template>

<script>
import ChatInput from './ChatInput.vue'
import ChatMessage from './ChatMessage.vue'
import { mapGetters, mapState } from 'vuex'
import { getInputFocus, useChat } from '../../useChat.js'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

const {
  setLoading,
  clearChats,
  addChatMessageById,
  newChatAndAddMessageById,
  removeLoadingMessageInChat
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
      prompt: '',
      chatId: '',
      showIntroduction: false,
      introduction: [],
      terminalContext: null,
      isTerminal: false,
      sessionChat: {},
      modelsLoaded: false,
      modelsLoading: false,
      modelsInitialized: false,
      models: [],
      selectedModel: '',
      sessionId: '',
      socket: null
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.chat.loading,
      activeChat: state => state.chat.activeChat
    }),
    ...mapGetters([
      'publicSettings'
    ])
  },
  methods: {
    init() {
      // 防止重复初始化时重复插入欢迎消息
      if (!this.activeChat?.chats || this.activeChat.chats.length === 0) {
        this.initChatMessage()
      }
      this.initSocket()
      if (!this.modelsInitialized) {
        this.modelsInitialized = true
        this.ensureModels()
      }
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
    initChatMessage() {
      this.prompt = ''
      this.showIntroduction = true
      this.chatId = ''
      if (this.$refs.chatInput?.select) {
        this.$refs.chatInput.select.value = ''
      }
      if (this.terminalContext) {
        this.prompt = this.terminalContext.content || ''
      }
      const chat = {
        message: {
          content: this.$t('ChatHello'),
          role: 'assistant',
          create_time: new Date()
        }
      }
      newChatAndAddMessageById(chat)
      setLoading(false)
    },
    getActiveProvider() {
      const config = this.publicSettings?.CHAT_AI_PROVIDERS || {}
      const providers = Array.isArray(config)
        ? config
        : (Array.isArray(config.providers) ? config.providers : [])
      const defaultName = config.defaultProvider

      const picked = (
        providers.find(item => item.name && item.name === defaultName) ||
        providers.find(item => item.is_assistant || item.IsAssistant) ||
        providers[0]
      )

      return picked || {
        base_url: process.env.VUE_APP_KAEL_HOST || '/kael',
        api_key: '',
        model: 'gpt-4o-mini'
      }
    },
    getApiBase(provider) {
      const envBase = process.env.VUE_APP_KAEL_HOST || ''
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
      let base = process.env.VUE_APP_KAEL_HOST || ''
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
      history.forEach(chat => {
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
      return (this.activeChat?.chats || []).find(item => item?.message?.id === id)
    },
    removeMessageById(id) {
      if (!id) return
      const chats = this.activeChat?.chats || []
      const index = chats.findIndex(item => item?.message?.id === id)
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
      const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]
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

      const hasContent = (chat?.result?.content || '').trim() !== '' || (chat?.reasoning?.content || '').trim() !== ''
      return hasContent ? chat : null
    },
    linkAssistantToLastUser(assistantChat) {
      if (!assistantChat?.message) return assistantChat
      const chats = this.activeChat?.chats || []
      const lastUser = [...chats].reverse().find(item => item?.message?.role === 'user')
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
      const startIndex = chats.findIndex(chat => chat?.message?.role === 'user')
      if (startIndex === -1) return []

      console.log('---------------- buildCompletedMessages ----------------', chats)

      let parentId = null
      for (let i = startIndex; i < chats.length; i += 1) {
        const chat = chats[i] || {}
        const message = chat.message || {}
        const role = message.role || ''
        if (!role) continue

        const content = role === 'assistant'
          ? (chat?.result?.content || message.content || '')
          : (message.content || '')
        const ts = message.create_time
          ? new Date(message.create_time).getTime()
          : now
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
          ...(msg.model ? { model: msg.model, modelName: msg.model } : (modelId ? { model: modelId, modelName: modelId } : {})),
          done: true
        }
        messageMap[id] = assistantItem
        messages.push(assistantItem)
      }

      Object.values(messageMap).forEach(msg => {
        if (msg.parentId && messageMap[msg.parentId]) {
          messageMap[msg.parentId].childrenIds.push(msg.id)
          const parentChat = chats.find(c => c?.message?.id === msg.parentId)
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

      return ordered.map(msg => ({
        ...msg,
        childrenIds: messageMap[msg.id].childrenIds || msg.childrenIds || []
      }))
    },
    async sendToKael(value, userMessageId) {
      const userId = userMessageId || this.genId()
      const responseId = this.genId()
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
        addChatMessageById(chat)
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

      const payload = {
        stream: true,
        model: modelId,
        messages: this.buildMessages(value, userId),
        chat_id: this.chatId || undefined,
        session_id: this.sessionId,
        params: {},
        tool_servers: [],
        features: payloadFeatures,
        variables: payloadVariables,
        model_item: payloadModelItem,
        id: responseId,
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
        console.log('chat contentType:', contentType)
        if (contentType.includes('text/event-stream')) {
          await this.handleStreamResponse(response, payload, provider, headers, responseId)
        } else {
          const data = await response.json()

          removeLoadingMessageInChat()
          const assistantChat = this.buildAssistantChat(data)
          if (assistantChat) {
            if (!assistantChat.message.id) {
              assistantChat.message.id = responseId
            }
            assistantChat.message.model = payload.model
            this.linkAssistantToLastUser(assistantChat)
            addChatMessageById(assistantChat)
            await this.notifyChatCompleted(provider, headers, assistantChat)
          }
          setLoading(false)
          getInputFocus()
        }
      } catch (error) {
        console.error(error)
        if (error?.name === 'AbortError') {
          removeLoadingMessageInChat()
          setLoading(false)
          return
        }
        removeLoadingMessageInChat()
        setLoading(false)
        const chat = {
          message: {
            content: error?.message || this.$t('ServerBusyRetry'),
            role: 'assistant',
            create_time: new Date()
          },
          type: 'error'
        }
        addChatMessageById(chat)
      } finally {
        this.controller = null
      }
    },
    async handleStreamResponse(response, payload, provider, headers, fallbackMessageId) {
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
          return 'done'
        }
        try {
          const data = JSON.parse(jsonStr)
          const delta = data?.choices?.[0]?.delta?.content || data?.content || ''
          if (delta) {
            if (!assistantAdded) {
              addChatMessageById(assistantChat)
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
        console.log('handleStreamResponse: read chunk', { readerDone, length: value?.length || 0 })
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
      setLoading(false)
      getInputFocus()
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
            id: message_id || this.genId(),
            content: '',
            role: 'assistant',
            create_time: new Date(),
            model: payload?.model || ''
          },
          result: {
            content: ''
          }
        }
        chat.message.id = chat.message.id || message_id || this.genId()
        chat.message.model = chat.message.model || payload?.model || ''
        addChatMessageById(chat)
        target = chat
        return target
      }

      const appendContent = (delta) => {
        const msg = ensureTarget()
        msg.message.content = (msg.message.content || '') + (delta || '')
        msg.result.content = (msg.result.content || '') + (delta || '')
      }

      if ((type === 'chat:message:delta' || type === 'message') && payload?.content) {
        appendContent(payload?.content || '')
      } else if ((type === 'chat:message' || type === 'replace') && payload?.content) {
        const msg = ensureTarget()
        msg.message.content = payload?.content || ''
        msg.result.content = payload?.content || ''
      } else if (type === 'chat:completion') {
        if (payload?.choices?.[0]?.delta?.content) {
          appendContent(payload.choices[0].delta.content)
        }
        if (payload?.content) {
          const msg = ensureTarget()
          msg.message.content = payload.content
          msg.result.content = payload.content
        }

        if (payload?.done === true) {
          removeLoadingMessageInChat()
          setLoading(false)
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
          this.models = data?.data || []
          if (!this.selectedModel) {
            const fromProvider = provider?.model
            this.selectedModel = fromProvider || this.models[0]?.id || ''
          }
          this.modelsLoaded = true
        }
      } catch (err) {
        console.warn('fetch models error', err)
      } finally {
        this.modelsLoading = false
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
        const modelItem = this.models.find(m => m.id === modelId) || { id: modelId }
        const messages = this.buildCompletedMessages(assistantChat?.message?.id, modelId, assistantChat)
        // 确保至少包含一问一答
        if (!messages.find(m => m.role === 'assistant') && assistantChat?.message) {
          const assistId = assistantChat.message.id || this.genId()
          const parentUser = messages.findLast ? messages.findLast(m => m.role === 'user') : [...messages].reverse().find(m => m.role === 'user')
          const parentId = parentUser?.id || null
          messages.push({
            id: assistId,
            role: 'assistant',
            parentId,
            childrenIds: [],
            content: assistantChat.message.content || assistantChat?.result?.content || '',
            timestamp: assistantChat.message.create_time ? new Date(assistantChat.message.create_time).getTime() : Date.now(),
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
        messages.forEach(msg => {
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
      const originSessionId = this.terminalContext?.sessionId
      const newSessionId = terminalContext.sessionId || ''
      if (newSessionId) {
        this.sessionId = newSessionId
        this.chatId = newSessionId
      }
      if (originSessionId) {
        this.saveSessionChat(originSessionId)
      }
      this.terminalContext = terminalContext
      this.isTerminal = true
      this.prompt = terminalContext.content || ''
      if (originSessionId !== newSessionId) {
        if (this.sessionChat[newSessionId]) {
          clearChats()
          for (const chat of this.sessionChat[newSessionId]) {
            addChatMessageById(chat)
          }
        } else {
          this.onNewChat()
        }
      }
    },
    saveSessionChat(sessionId) {
      if (this.terminalContext) {
        this.sessionChat[sessionId] = JSON.parse(JSON.stringify(this.activeChat.chats))
      }
    },
    onSendHandle(value) {
      this.showIntroduction = false
      const userMessageId = this.genId()
      this.addUserMessage(value, userMessageId)
      this.sendToKael(value, userMessageId)
    },
    addUserMessage(value, id) {
      const model = this.selectedModel || this.getActiveProvider()?.model || ''
      const chat = {
        message: {
          id: id || this.genId(),
          content: value,
          role: 'user',
          create_time: new Date(),
          ...(model ? { models: [model] } : {})
        }
      }
      addChatMessageById(chat)
    },
    onSelectModel(val) {
      this.selectedModel = val || this.selectedModel
    },
    onSelectPromptHandle(value) {
      this.prompt = value
      this.chatId = ''
      this.showIntroduction = false
      this.onSendHandle(value)
    },
    onNewChat() {
      clearChats()
      this.initChatMessage()
    },
    onStopHandle() {
      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }
      removeLoadingMessageInChat()
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
    transform: translateX(-50%);

    ::v-deep i {
      margin-right: 4px;
    }
  }
}
</style>
