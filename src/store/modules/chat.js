
const state = {
  loading: false,
  activeTab: 0,
  chatsStore: [],
  activeChat: {}
}

const mutations = {
  setLoading(state, loading) {
    state.loading = loading
  },

  setActiveChatConversationId(state, id) {
    state.activeChat.conversation_id = id
  },

  addChatToStore(state, data) {
    state.activeChat = data
  },

  addMessageToActiveChat(state, chat) {
    state.activeChat.chats?.push(chat)
  },

  clearChats(state) {
    state.activeChat.chats = []
  },

  removeLoadingMessageInChat(state) {
    const { chats } = state.activeChat
    const length = chats?.length
    if (length > 0) {
      const lastChat = chats[length - 1]
      if (lastChat?.message?.content === 'loading') {
        chats.pop()
      }
    }
  },

  updateChaMessageContentById(state, { id, data }) {
    const chats = state.activeChat.chats || []
    const filterChat = chats.filter((chat) => chat.message.id === id)?.[0] || {}
    if (Object.keys(filterChat).length > 0) {
      filterChat.message.content = data.message.content
    } else {
      chats?.push(data)
    }
  }
}

const actions = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
