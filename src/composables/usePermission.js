import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { getApiUrlRequirePerms, getRouteRequiredPerms, hasPermission } from '@/utils/jms/index'

export function hasPerm(perms) {
  return hasPermission(perms)
}

export function hasApiActionPerm(url, action) {
  const permsRequired = getApiUrlRequirePerms(url, action)
  return hasPermission(permsRequired)
}

export function getCurrentResActionPerms(route, action) {
  return getRouteRequiredPerms(route, action)
}

export function hasCurrentResAction(route, action) {
  const permsRequired = getCurrentResActionPerms(route, action)
  return hasPermission(permsRequired)
}

export function hasLicense(store) {
  return store.getters.hasValidLicense
}

export function isRootOrg(store) {
  return store.getters.currentOrgIsRoot
}

export function usePermission() {
  const route = useRoute()
  const store = useStore()

  return {
    hasPerm,
    hasApiActionPerm,
    getCurrentResActionPerms: (action) => getCurrentResActionPerms(route, action),
    hasCurrentResAction: (action) => hasCurrentResAction(route, action),
    hasLicense: () => hasLicense(store),
    isRootOrg: () => isRootOrg(store)
  }
}
