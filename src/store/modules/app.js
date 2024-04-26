import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  // 默认需要展开的菜单
  defaultOpensMenu: [],
  device: 'desktop',
  inited: false,
  i18nLoaded: false
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_INIT: (state, value) => {
    state.inited = value
  },
  SET_I18N_LOADED: (state, value) => {
    state.i18nLoaded = value
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  init({ commit }) {
    commit('SET_INIT', true)
  },
  reset({ commit }) {
    commit('SET_INIT', false)
  },
  setI18nLoaded({ commit }, value) {
    commit('SET_I18N_LOADED', value)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
