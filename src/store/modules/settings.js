import defaultSettings from '@/settings'
import { getPublicSettings } from '@/api/settings'
import { changeElementColor, changeThemeColors } from '@/utils/theme/index'
import { changeMenuColor } from '@/utils/theme/color'
import request from '@/utils/request'

const { showSettings, fixedHeader, sidebarLogo, tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  publicSettings: {},
  hasValidLicense: false,
  authMethods: {},
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
  SET_SECURITY_WATERMARK_ENABLED: (state, value) => {
    state.publicSettings['SECURITY_WATERMARK_ENABLED'] = value
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
  },
  updateAuthItemStatus({ commit }, payload) {
    const [key, value] = payload
    return new Promise((resolve, reject) => {
      const url = '/api/v1/settings/setting/?category=auth'
      const data = { [key]: value }
      request.patch(url, data).then(res => {
        state.authMethods[key] = value
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },
  getAuthMethods({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.authMethods && Object.keys(state.authMethods).length > 0) {
        resolve(state.authMethods)
      } else {
        const url = '/api/v1/settings/setting/?category=auth'
        request.get(url).then(res => {
          state.authMethods = res
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

