/* eslint-disable no-unused-vars */
import {
  login,
  logout,
  getInfo
} from '@/api/user'
import {
  getToken,
  getCurrentOrg,
  setCurrentOrg,
  setToken,
  removeToken
} from '@/utils/auth'
import {
  resetRouter
} from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    currentOrg: getCurrentOrg(),
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
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ORGS: (state, roles) => {
    state.orgs = roles
  },
  SET_CURRENT_ORG(state, z) {
    state.currentOrg = z
    setCurrentOrg(z)
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

  // get user info
  getInfo({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        const {
          role,
          name,
          avatar_url,
          admin_orgs
        } = response
        const rules = [role]
        // roles must be a non-empty array
        if (!rules || rules.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROLES', rules)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar_url)
        commit('SET_ORGS', admin_orgs)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({
    commit,
    state
  }) {
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
  resetToken({
    commit
  }) {
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
