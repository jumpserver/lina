<template>
  <div class="chat-content">
    <div id="scrollRef" class="chat-list">
      <div v-if="showIntroduction" class="introduction">
        <div v-for="(item, index) in introduction" :key="index" class="introduction-item" @click="sendIntroduction(item)">
          <div class="head">
            <i v-if="item.icon" :class="item.icon" />
            <span class="title">{{ item.title }}</span>
          </div>
          <div class="content">
            {{ item.content }}
          </div>
        </div>
      </div>
      <ChatMessage v-for="(item, index) in activeChat.chats" :key="index" :item="item" />
    </div>
    <div class="input-box">
      <el-button
        v-if="isLoading && socket && socket.readyState === 1"
        class="stop"
        icon="fa fa-stop-circle-o"
        round
        size="small"
        @click="onStopHandle"
      >{{ $tc('common.Stop') }}</el-button>
      <ChatInput ref="chatInput" @send="onSendHandle" @select-prompt="onSelectPromptHandle" />
    </div>
  </div>
</template>

<script>
import ChatInput from './ChatInput.vue'
import ChatMessage from './ChatMessage.vue'
import { mapState } from 'vuex'
import { closeWebSocket, createWebSocket, onSend, ws } from '@/utils/socket'
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
  },
  data() {
    return {
      socket: {},
      prompt: '',
      currentConversationId: '',
      showIntroduction: false,
      introduction: [
        {
          title: this.$t('common.introduction.ConceptTitle'),
          content: this.$t('common.introduction.ConceptContent')
        },
        {
          title: this.$t('common.introduction.IdeaTitle'),
          content: this.$t('common.introduction.IdeaContent')
        }
      ]
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
      const { NODE_ENV, VUE_APP_KAEL_HOST } = process.env || {}
      const api = '/kael/chat/system/'
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const path = `${protocol}://${window.location.host}${api}`
      const index = VUE_APP_KAEL_HOST?.indexOf('://')
      const localPath = protocol + VUE_APP_KAEL_HOST?.substring(index, VUE_APP_KAEL_HOST?.length) + api
      const url = NODE_ENV === 'development' ? localPath : path
      createWebSocket(url, this.onWebSocketMessage)
    },
    initChatMessage() {
      this.prompt = ''
      this.showIntroduction = true
      this.currentConversationId = ''
      this.$refs.chatInput.select.value = ''
      const chat = {
        message: {
          content: this.$t('common.ChatHello'),
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
      if (data.conversation_id) {
        setLoading(true)
        removeLoadingMessageInChat()
        this.currentConversationId = data.conversation_id
        updateChaMessageContentById(data.message.id, data)
      }
      if (data.message?.type === 'finish') {
        setLoading(false)
        getInputFocus()
      }
    },
    onSystemMessage(data) {
      data.message = {
        content: data.system_message,
        role: 'assistant',
        create_time: new Date()
      }
      removeLoadingMessageInChat()
      addMessageToActiveChat(data)
      this.socketReadyStateSuccess = false
      setLoading(true)
    },
    onSendHandle(value) {
      this.showIntroduction = false
      this.socket = ws || {}
      if (ws?.readyState === 1) {
        this.socketReadyStateSuccess = true
        const chat = {
          message: {
            content: value,
            role: 'user',
            create_time: new Date()
          }
        }
        const message = {
          content: value,
          prompt: this.prompt,
          conversation_id: this.currentConversationId || ''
        }
        addChatMessageById(chat)
        onSend(message)
        addTemporaryLoadingToChat()
      } else {
        const chat = {
          message: {
            content: this.$t('common.ConnectionDropped'),
            role: 'assistant',
            create_time: new Date()
          },
          type: 'error'
        }
        addChatMessageById(chat)
        this.socketReadyStateSuccess = false
        setLoading(true)
      }
    },
    onSelectPromptHandle(value) {
      this.prompt = value
      this.currentConversationId = ''
      this.showIntroduction = false
      this.onSendHandle(value)
    },
    onNewChat() {
      clearChats()
      this.initChatMessage()
    },
    onStopHandle() {
      this.$axios.post(
        '/kael/interrupt_current_ask/',
        { id: this.currentConversationId || '' }
      ).finally(() => {
        removeLoadingMessageInChat()
        setLoading(false)
      })
    },
    sendIntroduction(item) {
      this.showIntroduction = false
      this.onSendHandle(item.content)
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
    height: 160px;
    padding: 0 15px;
    margin-bottom: 15px;
    border-top: 1px solid #ececec;
  }
  .stop {
    position: absolute;
    top: -37px;
    left: 50%;
    z-index: 11;
    transform: translateX(-50%);
    >>> i {
      margin-right: 4px;
    }
  }
}
</style>
