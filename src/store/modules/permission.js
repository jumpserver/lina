import {
  allRoleRoutes,
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
function hasLicense(licState, route) {
  if (licState) {
    return licState
  }
  let requireLic = route.meta ? route.meta.licenseRequired : null
  if (!requireLic) {
    requireLic = false
  }
  return licState === requireLic
}

function hasCommand(cmdState, route) {
  if (cmdState) {
    return cmdState
  }
  let requireCmd = route.meta ? route.meta.commandExecutionRequired : null
  if (!requireCmd) {
    requireCmd = false
  }
  return cmdState === requireCmd
}

export function filterLicRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (hasLicense(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterLicRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

export function filterCmdRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = {
      ...route
    }
    if (hasCommand(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterCmdRoutes(tmp.children, roles)
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

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = routes.concat(constantRoutes)
  }
}

const actions = {
  generateRoutes({ commit, rootState }, roles) {
    return new Promise(resolve => {
      console.log(rootState)
      let accessedRoutes = filterAsyncRoutes(allRoleRoutes, roles)
      accessedRoutes = filterCmdRoutes(accessedRoutes, rootState.settings.publicSettings.SECURITY_COMMAND_EXECUTION)
      accessedRoutes = filterLicRoutes(accessedRoutes, rootState.settings.publicSettings.XPACK_ENABLED)
      commit('SET_ROUTES', accessedRoutes)
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
