import { logout, getProfile } from '@/api/users'
import {
  getTokenFromCookie,
  getCurrentOrgFromCookie,
  saveCurrentOrgToCookie,
  getCurrentRoleFromCookie,
  saveCurrentRoleToCookie
} from '@/utils/auth'
import { resetRouter } from '@/router'
import rolec from '@/utils/role'

const getDefaultState = () => {
  return {
    token: getTokenFromCookie(),
    currentOrg: getCurrentOrgFromCookie(),
    currentRole: getCurrentRoleFromCookie(),
    profile: {},
    roles: {},
    orgs: [],
    perms: 0b00000000
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
  SET_ROLES(state, roles) {
    state.roles = roles
  },
  SET_PERMS(state, perms) {
    state.perms = perms
  },
  SET_CURRENT_ORG(state, org) {
    saveCurrentOrgToCookie(org)
    state.currentOrg = org
  },
  SET_CURRENT_ROLE(state, role) {
    saveCurrentRoleToCookie(role)
    state.currentRole = role
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
        console.log(error)
        reject(error)
      })
    })
  },
  getRoles({ commit, dispatch, state }, refresh) {
    return new Promise((resolve, reject) => {
      if (!refresh && state.roles && state.roles.length > 0) {
        return resolve(state.roles)
      }
      return dispatch('getProfile').then((profile) => {
        const { current_org_roles: currentOrgRoles, role } = profile
        const roles = rolec.parseUserRoles(currentOrgRoles, role)
        commit('SET_ROLES', roles)
        resolve(roles)
      }).catch((e) => {
        reject(e)
      })
    })
  },
  getInOrgs({ commit, dispatch, state }, refresh) {
    return new Promise((resolve, reject) => {
      if (!refresh && state.role && state.role.length > 0) {
        return resolve(state.roles)
      }
      dispatch('getProfile').then(profile => {
        const { admin_or_audit_orgs: inOrgs } = profile
        commit('SET_ORGS', inOrgs)
        resolve(inOrgs)
      }).catch((e) => reject(e))
    })
  },
  getTotalPerms({ commit, dispatch, state }, refresh) {
    return new Promise((resolve, reject) => {
      if (!refresh && state.perms && state.perms !== 0) {
        return resolve(state.perms)
      }
      dispatch('getRoles').then(roles => {
        let perms = 0b00000000
        for (const role of roles) {
          perms |= role
        }
        commit('SET_PERMS', perms)
        resolve(perms)
      }).catch((e) => reject(e))
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
