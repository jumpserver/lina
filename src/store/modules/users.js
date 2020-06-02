import { logout, getProfile } from '@/api/users'
import {
  getTokenFromCookie,
  getCurrentOrgFromCookie,
  saveCurrentOrgToCookie
} from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getTokenFromCookie(),
    currentOrg: getCurrentOrgFromCookie(),
    profile: {},
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
      getProfile().then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const { admin_or_audit_orgs, current_org_roles } = response
        // roles must be a non-empty array
        if (!current_org_roles || current_org_roles.length <= 0) {
          reject('getProfile: roles must be a non-null array!')
        }

        commit('SET_PROFILE', response)
        commit('SET_ORGS', admin_or_audit_orgs)
        resolve(response)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
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
    console.log('users.setCurrentOrg: ', data)
    commit('SET_CURRENT_ORG', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
