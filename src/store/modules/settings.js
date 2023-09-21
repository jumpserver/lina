import defaultSettings from '@/settings'
import { getPublicSettings } from '@/api/settings'
import { changeElementColor, changeThemeColors } from '@/utils/theme/index'
import { changeMenuColor } from '@/utils/theme/color'

const { showSettings, fixedHeader, sidebarLogo, tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  publicSettings: null,
  hasValidLicense: false,
  themeColors: JSON.parse(localStorage.getItem('themeColors')) || {}
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_PUBLIC_SETTINGS: (state, settings) => {
    state.publicSettings = settings
    state.themeColors = settings?.INTERFACE?.theme_info?.colors || {}

    if (settings['XPACK_ENABLED']) {
      state.hasValidLicense = settings['XPACK_LICENSE_IS_VALID']
    }
  },
  setTheme(state, data) {
    state.themeColors = data
    localStorage.setItem('themeColors', JSON.stringify(data))
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
          const faviconURL = data['INTERFACE']?.favicon
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
          document.title = data['INTERFACE']['login_title']
        }
        const themeColors = data?.INTERFACE?.theme_info?.colors || {}
        commit('SET_PUBLIC_SETTINGS', data)
        changeThemeColors(themeColors)
        resolve(response)
      }).catch(error => {
        if (error.response && error.response.status === 400) {
          alert('自 v3.6 版本开始，要求配置可信任域名或主机，否则无法正常使用, 查看: https://github.com/jumpserver/jumpserver/releases/tag/v3.6.0')
        }
        reject(error)
      })
    })
  },
  changeThemeStyle({ commit }, themeColors) {
    changeMenuColor(themeColors)
    changeElementColor(themeColors)
    commit('setTheme', themeColors)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

