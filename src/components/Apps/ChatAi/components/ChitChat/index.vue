<template>
  <div class="chat-content">
    <div id="scrollRef" class="chat-list">
      <div v-if="showIntroduction" class="introduction">
        <div v-for="(item, index) in introduction" :key="index" class="introduction-item">
          <div class="head">
            <i v-if="item.icon" :class="item.icon" />
            <span class="title">{{ item.title }}</span>
          </div>
          <div class="content">
            {{ item.content }}
            <i class="fa fa-arrow-right" />
          </div>
        </div>
      </div>
      <ChatMessage v-for="(item, index) in activeChat.chats" :key="index" :item="item" />
      <el-button
        v-if="isLoading && socket && socket.readyState === 1"
        round
        size="small"
        class="stop"
        icon="fa fa-stop-circle-o"
        @click="onStopHandle"
      >{{ $tc('common.Stop') }}</el-button>
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
      socket: {},
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
        },
        {
          title: this.$t('common.introduction.ArticleTitle'),
          content: this.$t('common.introduction.ArticleContent')
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
  mounted() {
    this.initWebSocket()
    this.initChatMessage()
  },
  destroyed() {
    closeWebSocket()
  },
  methods: {
    initWebSocket() {
      const api = '/kael/chat/system/'
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const path = `${protocol}://${window.location.host}${api}`
      const localPath = process.env.VUE_APP_KAEL_WS + api
      const url = process.env.NODE_ENV === 'development' ? localPath : path
      createWebSocket(url, this.onWebSocketMessage)
    },
    initChatMessage() {
      this.showIntroduction = true
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
    onStopHandle() {
      this.$axios.post(
        '/kael/chat/system/interrupt_current_ask/',
        { id: this.currentConversationId || '' }
      ).finally(() => {
        removeLoadingMessageInChat()
        setLoading(false)
      })
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
    padding: 0 15px;
    overflow-y: auto;
    user-select: text;
    .stop {
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      >>> i {
        margin-right: 4px;
      }
    }
  }
  .input-box {
    height: 154px;
    padding: 0 15px;
    margin-bottom: 15px;
    border-top: 1px solid #ececec;
  }
}
</style>
