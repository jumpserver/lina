import { optionUrlMeta } from '@/api/common'

const getDefaultState = () => {
  return {
    metaMap: {},
    isRouterAlive: true,
    sqlQueryCounter: []
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
    return new Promise((resolve, reject) => {
      optionUrlMeta(url).then(meta => {
        commit('SET_URL_META', { url, meta })
        resolve(meta)
      }).catch(error => {
        reject(error)
      })
    })
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
    const sqlCount = resp.headers['x-jms-sql-count']
    if (!sqlCount || sqlCount < 3) {
      return
    }
    commit('addSQLQueryCounter', { url, count: sqlCount })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
