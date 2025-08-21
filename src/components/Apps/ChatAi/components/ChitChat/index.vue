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
      <ChatMessage v-for="(item, index) in activeChat.chats" :key="index" :item="item" :is-terminal="isTerminal" @insert-code="insertCode" />
    </div>
    <div class="input-box">
      <el-button
        v-if="isLoading && socket && socket.readyState === 1"
        class="stop"
        icon="fa fa-stop-circle-o"
        round
        size="small"
        @click="onStopHandle"
      >{{ $tc('Stop') }}</el-button>
      <ChatInput ref="chatInput" :expanded="expanded" :has-prompt="!isTerminal" @send="onSendHandle" @select-prompt="onSelectPromptHandle" />
    </div>
  </div>
</template>

<script>
import ChatInput from './ChatInput.vue'
import ChatMessage from './ChatMessage.vue'
import { mapState } from 'vuex'
import { closeWebSocket, createWebSocket, onSend, ws } from '@/utils/request'
import { getInputFocus, useChat } from '../../useChat.js'

const {
  setLoading,
  clearChats,
  addChatMessageById,
  addMessageToActiveChat,
  newChatAndAddMessageById,
  removeLoadingMessageInChat,
  updateChaMessageContentById,
  addTemporaryLoadingToChat
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
      socket: {},
      prompt: '',
      conversationId: '',
      showIntroduction: false,
      introduction: [],
      terminalContext: null,
      isTerminal: false,
      sessionChat: {}
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.chat.loading,
      activeChat: state => state.chat.activeChat
    })
  },
  destroyed() {
    closeWebSocket()
  },
  methods: {
    init() {
      this.initWebSocket()
      this.initChatMessage()
    },
    initWebSocket() {
      const { NODE_ENV, VUE_APP_KOKO_HOST } = process.env || {}
      const api = '/koko/ws/chat/system/'
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const path = `${protocol}://${window.location.host}${api}`
      const index = VUE_APP_KOKO_HOST?.indexOf('://')
      const localPath = protocol + VUE_APP_KOKO_HOST?.substring(index, VUE_APP_KOKO_HOST?.length) + api
      const url = NODE_ENV === 'development' ? localPath : path
      createWebSocket(url, this.onWebSocketMessage)
    },
    initChatMessage() {
      this.prompt = ''
      this.showIntroduction = true
      this.conversationId = ''
      this.$refs.chatInput.select.value = ''
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
    onWebSocketMessage(data) {
      if (data.type === 'message') {
        this.onChatMessage(data)
      }
      if (data.type === 'error') {
        this.onSystemMessage(data)
      }
    },
    onChatMessage(data) {
      if (data.id) {
        setLoading(true)
        removeLoadingMessageInChat()
        this.conversationId = data.id

        const newFragment = {
          message: { id: data.message.id, is_reasoning: data.message.is_reasoning },
          reasoning: { content: data.message.is_reasoning ? data.message.content : '' },
          result: { content: data.message.is_reasoning ? '' : data.message.content },
          role: data.message.role,
          type: data.message.type,
          create_time: data.message.create_time
        }

        updateChaMessageContentById(data.message.id, newFragment)
      }
      if (data.message?.type === 'finish') {
        setLoading(false)
        getInputFocus()
      }
    },
    onSystemMessage(data) {
      data.message = {
        content: data.data,
        role: 'assistant',
        create_time: new Date()
      }
      removeLoadingMessageInChat()
      addMessageToActiveChat(data)
      setLoading(true)
    },
    onTerminalContext(terminalContext) {
      const originSessionId = this.terminalContext?.sessionId
      const newSessionId = terminalContext.sessionId || ''
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
      this.socket = ws || {}
      if (ws?.readyState === 1) {
        const chat = {
          message: {
            content: value,
            role: 'user',
            create_time: new Date()
          }
        }
        const message = {
          data: value,
          prompt: this.prompt,
          id: this.conversationId || ''
        }
        addChatMessageById(chat)
        onSend(message)
        addTemporaryLoadingToChat()
      } else {
        const chat = {
          message: {
            content: this.$t('ConnectionDropped'),
            role: 'assistant',
            create_time: new Date()
          },
          type: 'error'
        }
        addChatMessageById(chat)
        setLoading(true)
      }
    },
    onSelectPromptHandle(value) {
      this.prompt = value
      this.conversationId = ''
      this.showIntroduction = false
      this.onSendHandle(value)
    },
    onNewChat() {
      clearChats()
      this.initChatMessage()
    },
    onStopHandle() {
      const message = {
        id: this.conversationId || '',
        interrupt: true
      }
      onSend(message)
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
