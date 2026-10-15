import { optionUrlMeta } from '@/api/common'

const getDefaultState = () => {
  return {
    isRouterAlive: true,
    sqlQueryCounter: [],
    showSqlQueryCounter: true,
    confirmDialogVisible: false,
    drawerActionMeta: {},
    drawerStack: [],
    drawerCloseNonce: 0,
    successActionMeta: {},
    inDrawer: false
  }
}

const state = getDefaultState()

const mutations = {
  reload: (state) => {
    // 通过切换 key 来强制 router-view 重新渲染，避免使用 v-if 反复销毁/重建根节点导致的 DOM 插入错误
    state.isRouterAlive = !state.isRouterAlive
  },
  addSQLQueryCounter: (state, { url, count }) => {
    if (count < 5) {
      return
    }
    state.sqlQueryCounter = state.sqlQueryCounter.filter((item) => item.url !== url)
    state.sqlQueryCounter.push({ url, count, time: new Date().getTime() })
    if (state.sqlQueryCounter.length > 5) {
      state.sqlQueryCounter.shift()
    }
  },
  setConfirmDialogVisible: (state, show) => {
    state.confirmDialogVisible = show
  }
}

const actions = {
  getUrlMeta(_, { url }) {
    return optionUrlMeta(url)
  },
  digestSQLQuery({ commit, state }, resp) {
    if (!resp || !resp.status.toString().startsWith('20')) {
      return
    }
    let url = resp.config.url
    if (url.indexOf('?') > 0) {
      url = url.substring(0, url.indexOf('?'))
    }
    url = url.replace('/api/v1', '')
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1)
    }
    let sqlCount = resp.headers['x-jms-sql-count']
    sqlCount -= 2
    if (!sqlCount || sqlCount < 3) {
      return
    }
    commit('addSQLQueryCounter', { url, count: sqlCount })
  },
  showConfirmDialog({ commit, state }, show) {
    commit('setConfirmDialogVisible', show)
  },
  showSqlQueryCounter({ commit, state }, show) {
    state.showSqlQueryCounter = show
  },
  setDrawerActionMeta({ commit, state }, meta) {
    const token = meta && meta.__drawerToken
    const publicMeta = { ...(meta || {}) }
    delete publicMeta.__drawerToken

    if (token) {
      const index = state.drawerStack.findIndex((item) => item.token === token)
      if (index >= 0) {
        state.drawerStack[index].meta = publicMeta
        if (index === state.drawerStack.length - 1) {
          state.drawerActionMeta = publicMeta
        }
      } else {
        state.drawerStack.push({ token, meta: publicMeta })
        state.drawerActionMeta = publicMeta
      }
      state.inDrawer = true
      return
    }

    // 没有 token 的旧调用方只覆盖当前 meta，不入栈。
    state.drawerActionMeta = publicMeta
    state.inDrawer = true
  },
  getDrawerActionMeta({ commit, state }) {
    return state.drawerActionMeta
  },
  leaveDrawer({ commit, state }, token) {
    const index = state.drawerStack.findIndex((item) => item.token === token)
    if (index < 0) {
      return
    }
    state.drawerStack.splice(index, 1)
    const top = state.drawerStack[state.drawerStack.length - 1]
    if (top) {
      state.drawerActionMeta = top.meta
      state.inDrawer = true
      return
    }
    state.drawerActionMeta = {}
    state.inDrawer = false
  },
  cleanDrawerActionMeta({ commit, state }) {
    state.drawerStack = []
    state.drawerActionMeta = {}
    state.inDrawer = false
  },
  finishDrawerActionMeta({ commit, state }, payload) {
    state.successActionMeta = payload
    state.drawerCloseNonce += 1
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
