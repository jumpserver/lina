import defaultSettings from '@/settings'
import { getPublicSettings, getLogo } from '@/api/settings'

const { showSettings, fixedHeader, sidebarLogo, tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  publicSettings: null,
  customSettings: null
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_PUBLIC_SETTINGS: (state, settings) => {
    state.publicSettings = settings
  },
  SET_CUSTOM_SETTINGS: (state, settings) => {
    state.customSettings = settings
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
        if (response.data.XPACK_ENABLED) {
          if (response.data.XPACK_LICENSE_IS_VALID) {
            getLogo().then((res) => {
              commit('SET_CUSTOM_SETTINGS', res)
            })
          }
        }
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

