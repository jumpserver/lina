import store from '@/store'
import { pageScroll } from '@/utils/common'

export const getInputFocus = () => {
  const dom = document.querySelector('.chat-input .el-textarea__inner')
  setTimeout(() => dom?.focus(), 200)
}

export function useChat() {
  const chatStore = {}

  const setLoading = (loading) => {
    store.commit('chat/setLoading', loading)
  }

  const onNewChat = (name) => {
    const data = {
      name: name || `new chat`,
      id: 1,
      conversation_id: '',
      chats: []
    }
    store.commit('chat/addChatToStore', data)
  }

  const clearChats = () => {
    store.commit('chat/clearChats')
  }

  const addMessageToActiveChat = (chat) => {
    store.commit('chat/addMessageToActiveChat', chat)
  }

  const removeLoadingMessageInChat = () => {
    store.commit('chat/removeLoadingMessageInChat')
  }

  const addChatMessageById = (chat) => {
    store.commit('chat/addMessageToActiveChat', chat)
    if (chat?.conversation_id) {
      store.commit('chat/setActiveChatConversationId', chat.conversation_id)
    }
    pageScroll('scrollRef')
  }

  const addTemporaryLoadingToChat = () => {
    const temporaryChat = {
      message: {
        content: 'loading',
        role: 'assistant',
        create_time: new Date()
      }
    }
    addChatMessageById(temporaryChat)
  }

  const newChatAndAddMessageById = (chat) => {
    onNewChat(chat.message.content)
    addChatMessageById(chat)
  }

  const updateChaMessageContentById = (id, data) => {
    store.commit('chat/updateChaMessageContentById', { id, data })
    pageScroll('scrollRef')
  }

  return {
    chatStore,
    setLoading,
    onNewChat,
    clearChats,
    getInputFocus,
    addMessageToActiveChat,
    newChatAndAddMessageById,
    removeLoadingMessageInChat,
    addChatMessageById,
    addTemporaryLoadingToChat,
    updateChaMessageContentById
  }
}
