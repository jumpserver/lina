
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
    const index = chats.findIndex((chat) => chat.message.id === data.message.id)

    if (index === -1) {
      // 如果没有记录，直接添加新消息
      chats.push({
        message: { id: data.message.id },
        reasoning: { content: data.reasoning.content },
        result: { content: data.result.content },
        role: data.role,
        type: data.type,
        create_time: data.create_time
      })
    } else {
      if (data.reasoning.content !== '') {
        chats[index].reasoning.content = data.reasoning.content
      }

      if (data.result.content !== '') {
        chats[index].result.content = data.result.content
      }
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
