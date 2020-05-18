import defaultSettings from '@/settings'
import { getPublicSettings } from '@/api/settings'

const { showSettings, fixedHeader, sidebarLogo, tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  publicSettings: null
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_PUBLIC_SETTINGS: (state, settings) => {
    state.publicSettings = settings
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  // get user Profile
  getPublicSettings({ commit, state }) {
    return new Promise((resolve, reject) => {
      getPublicSettings().then(response => {
        commit('SET_PUBLIC_SETTINGS', response.data)
        resolve(response)
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

