import {
  adminRoutes,
  userRoutes,
  constantRoutes
} from '@/router'
import _ from 'lodash'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

export function filterNoneXpackRoutes(routes) {
  const accessedRoutes = []
  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (tmp.name !== 'Xpack' && tmp.name !== 'Tickets') {
      if (tmp.name === 'applications' || tmp.name === 'Perms') {
        tmp.children = _.remove(tmp.children, (n) => {
          return !n.name.includes('RemoteApp')
        })
        console.log(tmp.children)
      }
      accessedRoutes.push(tmp)
    }
  })
  return accessedRoutes
}

export function filterUserNoneXpackRoutes(routes) {
  const accessedRoutes = []
  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (tmp.name === 'Apps') {
      tmp.children = _.remove(tmp.children, (n) => {
        return !n.name.includes('remoteapp')
      })
    }
    accessedRoutes.push(tmp)
  })
  return accessedRoutes
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes(store, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('Admin')) {
        accessedRoutes = adminRoutes || []
        if (!store.rootState.settings.publicSettings.XPACK_LICENSE_IS_VALID) {
          accessedRoutes = filterNoneXpackRoutes(adminRoutes)
        }
      } else if (roles.includes('User')) {
        accessedRoutes = userRoutes || []
        // accessedRoutes = filterAsyncRoutes(userRoutes, roles)
        if (!store.rootState.settings.publicSettings.XPACK_LICENSE_IS_VALID) {
          accessedRoutes = filterUserNoneXpackRoutes(userRoutes)
        }
      }
      store.commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
