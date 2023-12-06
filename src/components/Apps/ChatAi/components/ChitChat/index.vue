<template>
  <div class="chat-content">
    <div id="scrollRef" class="chat-list">
      <ChatMessage v-for="(item, index) in activeChat.chats" :key="index" :item="item" />
    </div>
    <div class="input-box">
      <ChatInput @send="onSendHandle" />
    </div>
  </div>
</template>

<script>
import ChatInput from './ChatInput.vue'
import ChatMessage from './ChatMessage.vue'
import { mapState } from 'vuex'
import { createWebSocket, closeWebSocket, ws, onSend } from '@/utils/socket'
import { getInputFocus, useChat } from '../../useChat.js'

const {
  setLoading,
  addChatMessageById,
  addMessageToActiveChat,
  newChatAndAddMessageById,
  removeLoadingMessageInChat,
  removeLoadingAndAddMessageToChat,
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
      currentConversationId: ''
    }
  },
  computed: {
    ...mapState({
      activeChat: state => state.chat.activeChat
    })
  },
  mounted() {
    this.initWebSocket()
    this.initChatMessage()
  },
  destroyed() {
    closeWebSocket()
  },
  methods: {
    initWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const path = `${protocol}://${window.location.host}/kael/chat/system/`
      const localPath = process.env.VUE_APP_KAEL_WS + '/kael/chat/system/'
      const url = process.env.NODE_ENV === 'development' ? localPath : path
      createWebSocket(url, this.onWebSocketMessage)
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
      if (!data.message.content && data.conversation_id) {
        setLoading(true)
        removeLoadingAndAddMessageToChat(data)
        this.currentConversationId = data.conversation_id
      } else {
        updateChaMessageContentById(data.message.id, data.message.content)
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
    initChatMessage() {
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
    onSendHandle(value) {
      if (ws.readyState === 1) {
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
  .chat-list {
    flex: 1;
    padding: 0 15px;
    overflow-y: auto;
    user-select: text;
  }
  .input-box {
    height: 154px;
    padding: 0 15px;
    margin-bottom: 15px;
    border-top: 1px solid #ececec;
  }
}
</style>
