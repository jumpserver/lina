import { getProfile as apiGetProfile, logout } from '@/api/users'
import { getCurrentOrgLocal, getTokenFromCookie, saveCurrentOrgLocal } from '@/utils/auth'
import { resetRouter } from '@/router'
import Vue from 'vue'

const _ = require('lodash')

const getDefaultState = () => {
  return {
    token: getTokenFromCookie(),
    currentOrg: '',
    preOrg: '',
    profile: {},
    username: '',
    auditOrgs: [],
    consoleOrgs: [],
    workbenchOrgs: [],
    noRootWorkbenchOrgs: [],
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
    state.noRootWorkbenchOrgs = profile['workbench_orgs'].filter(item => {
      return item.id !== '00000000-0000-0000-0000-000000000000'
    })
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
  DELETE_ORG: (state, org) => {
    state.consoleOrgs = state.consoleOrgs.filter(i => i.id !== org.id)
  },
  SET_CURRENT_ORG(state, org) {
    if (state.currentOrg?.name !== 'System') {
      state.preOrg = state.currentOrg
    }
    state.currentOrg = org
    saveCurrentOrgLocal(state.username, org)
  },
  SET_MFA_VERIFY(state) {
    state.MFAVerifyAt = (new Date()).valueOf()
  },
  ADD_WORKBENCH_ORGS(state, org) {
    state.workbenchOrgs.push(org)
  },
  SET_IS_FIRST_LOGIN(state, flag) {
    state.profile.is_first_login = flag
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
  deleteAdminOrg({ commit }, org) {
    commit('DELETE_ORG', org)
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
  setPreOrg({ commit }, data) {
    commit('SET_PRE_ORG', data)
  },
  currentUserJoinNewOrg({ state, commit }, users) {
    const { profile, currentOrg, workbenchOrgs } = state
    if (users.includes(profile.id)) {
      const currentOrgInfo = { id: currentOrg.id, name: currentOrg.name }
      const notExistInWorkbenchOrgs = _.find(workbenchOrgs, currentOrgInfo)
      if (!notExistInWorkbenchOrgs) {
        commit('ADD_WORKBENCH_ORGS', currentOrg)
      }
    }
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
  },
  ifFirstLogin({ commit }, flag) {
    commit('SET_IS_FIRST_LOGIN', flag)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
