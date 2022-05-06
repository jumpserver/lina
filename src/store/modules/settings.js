import defaultSettings from '@/settings'
import { getPublicSettings } from '@/api/settings'

const { showSettings, fixedHeader, sidebarLogo, tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  publicSettings: null,
  hasValidLicense: false
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_PUBLIC_SETTINGS: (state, settings) => {
    state.publicSettings = settings

    if (settings['XPACK_ENABLED']) {
      state.hasValidLicense = settings['XPACK_LICENSE_IS_VALID']
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  // get user Profile
  getPublicSettings({ commit, state }, isOpen) {
    return new Promise((resolve, reject) => {
      getPublicSettings(isOpen).then(response => {
        const data = response || {}
        if (isOpen) {
          const faviconURL = data['LOGO_URLS']?.favicon
          let link = document.querySelector("link[rel*='icon']")
          if (!link) {
            link = document.createElement('link')
            link.type = 'image/x-icon'
            link.rel = 'shortcut icon'
            document.getElementsByTagName('head')[0].appendChild(link)
          }
          if (faviconURL) {
            link.href = faviconURL
          }
          // 动态修改Title
          document.title = data['LOGIN_TITLE']
        }
        commit('SET_PUBLIC_SETTINGS', data)
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

