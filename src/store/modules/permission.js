import {
  adminRoutes,
  userRoutes,
  constantRoutes
} from '@/router'
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
    if (tmp.name === 'Xpack') {
      tmp.children = []
      route.children.forEach(childRoute => {
        if (childRoute.path === 'license') {
          tmp.children.push(childRoute)
        }
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
      } else {
        accessedRoutes = filterAsyncRoutes(userRoutes, roles)
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
