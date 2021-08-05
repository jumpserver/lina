import {
  allRoutes,
  constantRoutes
} from '@/router'
import rolec from '@/utils/role'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  let requirePerms = route.meta ? route.meta.permissions : null
  if (!requirePerms) {
    requirePerms = [rolec.PERM_ADMIN]
  }
  const has = rolec.hasPerm(roles, requirePerms)
  // console.log('Has route permission: ', route.path, requirePermsSum, userRolesSum, ' => ', has, roles)
  return has
}

function hasLicense(route, rootState) {
  const licenseIsValid = rootState.settings.hasValidLicense
  const licenseRequired = route.meta ? route.meta.licenseRequired : false
  if (!licenseIsValid && licenseRequired) {
    return false
  }
  return true
}

export function filterLicenseRequiredRoutes(routes, rootState) {
  const res = []

  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (hasLicense(route, rootState)) {
      if (tmp.children) {
        tmp.children = filterLicenseRequiredRoutes(tmp.children, rootState)
      }
      res.push(tmp)
    }
  })

  return res
}

function isNeedHidden(route, rootState) {
  let hidden = route.meta ? route.meta.hidden : false
  if (typeof hidden === 'function') {
    hidden = hidden({ route: route, settings: rootState.settings.publicSettings })
  }
  return hidden
}

export function filterHiddenRoutes(routes, rootState) {
  const res = []

  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (!isNeedHidden(route, rootState)) {
      if (tmp.children) {
        tmp.children = filterHiddenRoutes(tmp.children, rootState)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  for (const route of routes) {
    const tmp = {
      ...route
    }

    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  }
  return res
}

const state = {
  routes: [],
  currentViewRoute: {},
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, { accessedRoutes, viewRoute }) => {
    state.addRoutes = accessedRoutes
    state.routes = accessedRoutes.concat(constantRoutes)
    state.currentViewRoute = viewRoute
  }
}

const actions = {
  generateRoutes({ commit, rootState }, { to, from }) {
    return new Promise(resolve => {
      const path = to.path
      const re = new RegExp('/(\\w+)/.*')
      const matched = path.match(re)
      if (!matched) {
        console.log('Not match path', path)
        return resolve([])
      }
      const viewName = matched[1]
      console.log('View: ', viewName)
      // const view = matched[1]
      // let accessedRoutes = filterAsyncRoutes(viewRoutes, {})
      // accessedRoutes = filterHiddenRoutes(accessedRoutes, rootState)
      // accessedRoutes = filterLicenseRequiredRoutes(accessedRoutes, rootState)
      // if (accessedRoutes.length === 0) {
      //   console.log('No route find')
      // }
      const accessedRoutes = allRoutes
      let viewRoute = {}
      for (const route of accessedRoutes) {
        if (route.meta.view === viewName) {
          viewRoute = route
        }
      }
      console.log('Current view route: ', viewRoute)
      commit('SET_ROUTES', { accessedRoutes, viewRoute })
      console.log('Routes: ', accessedRoutes)
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
