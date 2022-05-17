import { logout, getProfile as apiGetProfile } from '@/api/users'
import {
  getCurrentOrgLocal,
  getTokenFromCookie,
  saveCurrentOrgLocal
} from '@/utils/auth'
import { resetRouter } from '@/router'
import Vue from 'vue'

const getDefaultState = () => {
  return {
    token: getTokenFromCookie(),
    currentOrg: '',
    profile: {},
    username: '',
    auditOrgs: [],
    consoleOrgs: [],
    workbenchOrgs: [],
    usingOrgs: [],
    perms: [],
    MFAVerifyAt: null,
    isSuperAdmin: false,
    isAdmin: false,
    hasAdminPerm: false,
    hasAuditPerm: false
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_PROFILE: (state, profile) => {
    state.profile = profile
    state.username = profile.username
    state.perms = profile.perms
    state.consoleOrgs = profile['console_orgs']
    state.workbenchOrgs = profile['workbench_orgs']
    state.auditOrgs = profile['audit_orgs']
    state.currentOrg = getCurrentOrgLocal(profile.username)
  },
  SET_USING_ORGS: (state, orgs) => {
    state.usingOrgs = orgs
  },
  MODIFY_ORG: (state, org) => {
    state.consoleOrgs = state.consoleOrgs.map(oldOrg => {
      if (oldOrg.id === org.id) {
        oldOrg.name = org.name
      }
      return oldOrg
    })
  },
  ADD_ORG: (state, org) => {
    state.consoleOrgs.push(org)
  },
  SET_CURRENT_ORG(state, org) {
    state.currentOrg = org
    saveCurrentOrgLocal(state.username, org)
  },
  SET_MFA_VERIFY(state) {
    state.MFAVerifyAt = (new Date()).valueOf()
  }
}

const actions = {
  // get user Profile
  getProfile({ commit, state }, refresh = false) {
    return new Promise((resolve, reject) => {
      if (!refresh && state.profile && Object.keys(state.profile).length > 0) {
        resolve(state.profile)
        return
      }
      apiGetProfile().then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        commit('SET_PROFILE', response)
        resolve(response)
      }).catch(error => {
        // debug(error)
        reject(error)
      })
    })
  },
  addAdminOrg({ commit, state }, org) {
    commit('ADD_ORG', org)
  },
  modifyOrg({ commit, state }, org) {
    commit('MODIFY_ORG', org)
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        // removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  setCurrentOrg({ commit }, data) {
    commit('SET_CURRENT_ORG', data)
  },
  setMFAVerify({ commit }) {
    commit('SET_MFA_VERIFY')
  },
  changeToView({ commit }, viewName) {
    const mapper = {
      console: state.consoleOrgs,
      audit: state.auditOrgs,
      workbench: state.workbenchOrgs,
      tickets: state.consoleOrgs
    }
    const usingOrgs = mapper[viewName] || state.consoleOrgs
    Vue.$log.debug('Set using orgs: ', viewName, usingOrgs)
    commit('SET_USING_ORGS', usingOrgs)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
