import Vue from 'vue'
import {
  allRoutes,
  constantRoutes
} from '@/router'
import empty from '@/layout/empty'
import Layout from '@/layout/index'
import { getResourceNameByPath } from '@/utils/jms'

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

function hasPermission(perms, route) {
  console.log('>>> Route: ', route)
  const permsRequired = route.meta?.permissions
  Vue.$log.debug('Route permissions required: ', route.path, permsRequired)
  let has
  if (!permsRequired || permsRequired.length === 0) {
    has = true
  } else {
    has = perms.some(perm => {
      return permsRequired.includes(perm)
    })
  }
  Vue.$log.debug('Has permission: ', route.path, ' => ', has)
  return has
}

const actionMapper = {
  create: 'add',
  update: 'change',
  list: 'view',
  destroy: 'del',
  retrieve: 'view'
}

function getRouteDefaultPerms(route) {
  if (route.component === empty || route.component === Layout) {
    return []
  }

  const permAction = actionMapper[route.meta.action] || 'view'
  const resource = route.meta.resource
  const app = route.meta.app
  return [`${app}.${permAction}_${resource}`]
}

function cleanRouteAction(route) {
  let action = ''
  const path = route.path || ''
  if (path.indexOf('create') > -1) {
    action = 'create'
  } else if (path.indexOf('update') > -1) {
    action = 'update'
  } else if (path.indexOf('delete') > -1) {
    action = 'destroy'
  } else if (path.indexOf(':id') > -1) {
    action = 'retrieve'
  } else {
    action = 'list'
  }
  return action
}

function cleanRoute(tmp, parent) {
  if (!parent) {
    parent = { meta: { level: 0 }}
  }
  if (!parent.meta) {
    parent.meta = {}
  }
  if (!tmp.meta) {
    tmp.meta = {}
  }
  if (!tmp.meta.level) {
    tmp.meta.level = parent.meta.level + 1
  }
  const typeMapper = { 1: 'view', 2: 'app', 3: 'resource', 4: 'curd' }
  if (!tmp.meta.type) {
    tmp.meta.type = typeMapper[tmp.meta.level]
  }

  const path = tmp.path || ''
  const pathSlice = path.split('/')
  const pathValue = pathSlice[pathSlice.length - 1]
  if (!tmp.meta.view) {
    tmp.meta.view = tmp.meta.level === 1 ? pathValue : parent.meta?.view
  }
  if (!tmp.meta.app) {
    tmp.meta.app = tmp.meta.level === 2 ? pathValue : parent.meta?.app
  }
  if (!tmp.meta.resource) {
    const resource = getResourceNameByPath(pathValue)
    tmp.meta.resource = tmp.meta.level === 3 ? resource : parent.meta?.resource
  }
  if (!tmp.meta.action) {
    tmp.meta.action = cleanRouteAction(tmp)
  }
  if (!tmp.meta.permissions) {
    tmp.meta.permissions = getRouteDefaultPerms(tmp)
  }
  return tmp
}

export function filterPermedRoutes(routes, rootState, permsCache, parent) {
  const res = []
  const perms = permsCache || rootState.users.perms

  for (const route of routes) {
    let tmp = {
      ...route
    }
    tmp = cleanRoute(tmp, parent)

    if (hasPermission(perms, tmp)) {
      if (tmp.children) {
        tmp.children = filterPermedRoutes(tmp.children, rootState, perms, tmp)
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
  SET_ROUTES: (state, { routes }) => {
    state.addRoutes = routes
    state.routes = routes.concat(constantRoutes)
  },
  SET_VIEW_ROUTE: (state, viewRoute) => {
    console.log('Current view route: ', viewRoute)
    state.currentViewRoute = viewRoute
  }
}

const actions = {
  generateViewRoutes({ commit, rootState }, { to, from }) {
    Vue.$log.debug('>>>>>>>>>>>>>>>: generate view routes')
    return new Promise(resolve => {
      const path = to.path
      const re = new RegExp('/(\\w+)/?.*')
      const matched = path.match(re)
      if (!matched) {
        Vue.$log.error('Not match path', path)
        return resolve([])
      }
      const viewName = matched[1]
      let viewRoute = {}
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
      let routes = filterPermedRoutes(allRoutes, rootState)
      routes = filterHiddenRoutes(routes, rootState)
      routes = filterLicenseRequiredRoutes(routes, rootState)
      if (routes.length === 0) {
        console.log('No route find')
      } else {
        console.log('Routes: ', routes)
      }
      // const routes = allRoutes
      commit('SET_ROUTES', { routes })
      dispatch('generateViewRoutes', { from, to })
      resolve(routes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
