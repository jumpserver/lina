
const state = {
  loading: false,
  tabNum: 0,
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

  updateChaMessageContentById(state, { id, content }) {
    const chats = state.activeChat.chats || []
    const filterChat = chats.filter((chat) => chat.message.id === id)?.[0] || {}
    filterChat.message.content = content
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
