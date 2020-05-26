import { optionUrlMeta } from '@/api/common'

const getDefaultState = () => {
  return {
    metaMap: {}
  }
}

const state = getDefaultState()

const mutations = {
  SET_URL_META: (state, { url, meta }) => {
    state.metaMap[url] = meta
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
