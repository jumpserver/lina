import { logout, getProfile } from '@/api/users'
import {
  getTokenFromCookie,
  getCurrentOrgFromCookie,
  saveCurrentOrgToCookie,
  getCurrentRoleFromCookie,
  saveCurrentRoleToCookie
} from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getTokenFromCookie(),
    currentOrg: getCurrentOrgFromCookie(),
    currentRole: getCurrentRoleFromCookie(),
    profile: {},
    roles: [],
    orgs: []
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
  },
  SET_ORGS: (state, orgs) => {
    state.orgs = orgs
  },
  SET_CURRENT_ORG(state, org) {
    saveCurrentOrgToCookie(org)
    state.currentOrg = org
  },
  SET_CURRENT_ROLE(state, role) {
    saveCurrentRoleToCookie(role)
    state.currentRole = role
  },
  SET_ROLES(state, roles) {
    state.roles = roles
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
  getProfile({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.profile) {
        resolve(state.profile)
        return
      }
      getProfile().then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const { admin_or_audit_orgs, current_org_roles, role } = response
        // roles must be a non-empty array
        const roles = current_org_roles || []
        if (role === 'Admin') {
          roles.push('SuperAdmin')
        }
        if (!roles || roles.length <= 0) {
          reject('getProfile: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_PROFILE', response)
        commit('SET_ORGS', admin_or_audit_orgs)
        resolve(response)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },
  getRoles({ commit, state }) {

  },
  getOrgs({ commit, state }) {

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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
