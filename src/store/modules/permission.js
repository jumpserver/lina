import {
  allRoutes,
  constantRoutes
} from '@/router'
/**
 * Use meta.role to determine if the current user has permission
 * @param perms
 * @param route
 */
function hasPermission(perms, route) {
  const permsRequired = route.meta?.permissions
  if (!permsRequired) {
    return true
  }
  const hasPermission = perms.some(perm => {
    return permsRequired.includes(perm)
  })
  console.log('Has route permission: ', route.name, ' => ', hasPermission, permsRequired)
  return hasPermission
}

function hasLicense(route, rootState) {
  const licenseIsValid = rootState.settings.hasValidLicense
  const licenseRequired = route.meta?.licenseRequired
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

export function filterAsyncRoutes(routes, rootState, permsCache) {
  const res = []
  const perms = permsCache || rootState.users.perms

  for (const route of routes) {
    const tmp = {
      ...route
    }

    if (hasPermission(perms, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, rootState, perms)
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
  SET_ROUTES: (state, { accessedRoutes }) => {
    state.addRoutes = accessedRoutes
    state.routes = accessedRoutes.concat(constantRoutes)
  },
  SET_VIEW_ROUTE: (state, viewRoute) => {
    state.currentViewRoute = viewRoute
  }
}

const actions = {
  generateViewRoutes({ commit, rootState }, { to, from }) {
    console.log('>>>>>>>>>>>>>>>: generate view routes')
    return new Promise(resolve => {
      const path = to.path
      const re = new RegExp('/(\\w+)/?.*')
      const matched = path.match(re)
      if (!matched) {
        console.log('Not match path', path)
        return resolve([])
      }
      const viewName = matched[1]
      let viewRoute = {}
      console.log('View: ', viewName)
      for (const route of state.routes) {
        if (route.meta?.view === viewName) {
          viewRoute = route
        }
      }
      commit('SET_VIEW_ROUTE', viewRoute)
    })
  },
  generateRoutes({ commit, dispatch, rootState }, { to, from }) {
    return new Promise(resolve => {
      let accessedRoutes = filterAsyncRoutes(allRoutes, rootState)
      accessedRoutes = filterHiddenRoutes(accessedRoutes, rootState)
      accessedRoutes = filterLicenseRequiredRoutes(accessedRoutes, rootState)
      if (accessedRoutes.length === 0) {
        console.log('No route find')
      } else {
        console.log('Routes: ', accessedRoutes)
      }
      // const accessedRoutes = allRoutes
      commit('SET_ROUTES', { accessedRoutes })
      dispatch('generateViewRoutes', { from, to })
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
