import { logout, getProfile } from '@/api/users'
import {
  getToken,
  getCurrentOrg,
  setCurrentOrg
} from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    profile: {},
    currentOrg: getCurrentOrg(),
    orgs: [],
    internalInit: Boolean
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
  SET_STATUS: (state) => {
    state.internalInit = true
  },
  SET_ORGS: (state, orgs) => {
    // API BUG FIX
    for (let index = 0; index < orgs.length; index++) {
      if (orgs[index].id === 'DEFAULT') {
        orgs[index].id = ''
      }
    }
    state.orgs = orgs
  },
  SET_CURRENT_ORG(state, org) {
    state.currentOrg = org
    setCurrentOrg(org)
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
      if (!state.internalInit) {
        reject('Init failed, please Login again.')
      }
      getProfile().then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const { admin_or_audit_orgs, rule } = response
        const rules = [rule]
        // roles must be a non-empty array
        if (!rules || rules.length <= 0) {
          reject('getProfile: roles must be a non-null array!')
        }

        commit('SET_PROFILE', response)
        commit('SET_ORGS', admin_or_audit_orgs)
        commit('SET_STATUS')
        resolve(response)
      }).catch(error => {
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
    commit('SET_CURRENT_ORG', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
