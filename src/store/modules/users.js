import { logout, getProfile } from '@/api/users'
import {
  getCurrentOrgLocal,
  getCurrentRoleLocal,
  getTokenFromCookie,
  saveCurrentOrgLocal,
  saveCurrentRoleLocal
} from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getTokenFromCookie(),
    currentOrg: '',
    profile: {},
    username: '',
    orgs: [],
    perms: [],
    MFAVerifyAt: null,
    isSuperAdmin: false,
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
    const username = profile.username
    state.username = username
    state.currentOrg = getCurrentOrgLocal(username)
    state.currentRole = getCurrentRoleLocal(username)
    state.perms = profile.perms
    state.orgs = profile.orgs
  },
  SET_ORGS: (state, orgs) => {
    state.orgs = orgs
  },
  MODIFY_ORG: (state, org) => {
    state.orgs = state.orgs.map(oldOrg => {
      if (oldOrg.id === org.id) {
        oldOrg.name = org.name
      }
      return oldOrg
    }
    )
  },
  ADD_ORG: (state, org) => {
    state.orgs.push(org)
  },
  SET_CURRENT_ORG(state, org) {
    state.currentOrg = org
    saveCurrentOrgLocal(state.username, org)
  },
  SET_CURRENT_ROLE(state, role) {
    state.currentRole = role
    saveCurrentRoleLocal(state.username, role)
  },
  SET_MFA_VERIFY(state) {
    state.MFAVerifyAt = (new Date()).valueOf()
  }
}

const actions = {
  // user login
  // login({ commit }, userInfo) {
  //   const { username, password } = userInfo
  //   return new Promise((resolve, reject) => {
  //     login({ username: username.trim(), password: password }).then(response => {
  //       const { data } = response
  //       commit('SET_TOKEN', data.token)
  //       setToken(data.token)
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // get user Profile
  getProfile({ commit, state }, refresh = false) {
    return new Promise((resolve, reject) => {
      if (!refresh && state.profile && Object.keys(state.profile).length > 0) {
        resolve(state.profile)
        return
      }
      getProfile().then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        commit('SET_PROFILE', response)
        resolve(response)
      }).catch(error => {
        // console.log(error)
        reject(error)
      })
    })
  },
  getInOrgs({ commit, dispatch, state }, refresh) {
    return new Promise((resolve, reject) => {
      if (!refresh && state.role && state.role.length > 0) {
        return resolve(state.roles)
      }
      dispatch('getProfile').then(profile => {
        const { orgs } = profile
        commit('SET_ORGS', orgs)
        resolve(orgs)
      }).catch((e) => reject(e))
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

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      // removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },
  setCurrentOrg({ commit }, data) {
    commit('SET_CURRENT_ORG', data)
  },
  setCurrentRole({ commit }, role) {
    commit('SET_CURRENT_ROLE', role)
  },
  setMFAVerify({ commit }) {
    commit('SET_MFA_VERIFY')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
