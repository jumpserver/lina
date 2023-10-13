import { optionUrlMeta } from '@/api/common'

const getDefaultState = () => {
  return {
    metaMap: {},
    metaPromiseMap: {},
    isRouterAlive: true,
    sqlQueryCounter: [],
    confirmDialogVisible: false
  }
}

const state = getDefaultState()

const mutations = {
  SET_URL_META: (state, { url, meta }) => {
    state.metaMap[url] = meta
  },
  reload: (state) => {
    state.isRouterAlive = false
    setTimeout(() => {
      state.isRouterAlive = true
    }, 0)
  },
  addSQLQueryCounter: (state, { url, count }) => {
    state.sqlQueryCounter = state.sqlQueryCounter.filter(item => item.url !== url)
    state.sqlQueryCounter.push({ url, count, time: new Date().getTime() })
    if (state.sqlQueryCounter.length > 10) {
      state.sqlQueryCounter.shift()
    }
  },
  setConfirmDialogVisible: (state, show) => {
    state.confirmDialogVisible = show
  }
}

const actions = {
  // get user info
  getUrlMeta({ commit, state }, { url }) {
    const meta = state.metaMap[url]
    if (meta) {
      return new Promise((resolve, reject) => {
        resolve(meta)
      })
    }
    let promise = state.metaPromiseMap[url]
    if (promise) {
      return promise
    }
    promise = new Promise((resolve, reject) => {
      optionUrlMeta(url).then(meta => {
        commit('SET_URL_META', { url, meta })
        resolve(meta)
      }).catch(error => {
        reject(error)
      }).finally(() => {
        state.metaPromiseMap[url] = null
      })
    })
    state.metaPromiseMap[url] = promise
    return promise
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
