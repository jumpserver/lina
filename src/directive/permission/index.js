import { hasPermission, getRouteRequiredPerms, getApiUrlRequirePerms } from '@/utils/jms/index'
import permission from './permission'

export function installPermissionDirective(app) {
  app.directive('perms', permission)

  app.config.globalProperties.$hasPerm = function(perms) {
    return hasPermission(perms)
  }

  app.config.globalProperties.$hasApiActionPerm = function(url, action) {
    const permsRequired = getApiUrlRequirePerms(url, action)
    return hasPermission(permsRequired)
  }

  app.config.globalProperties.$getCurrentResActionPerms = function(action) {
    return getRouteRequiredPerms(this.$route, action)
  }

  app.config.globalProperties.$hasCurrentResAction = function(action) {
    const permsRequired = getRouteRequiredPerms(this.$route, action)
    return hasPermission(permsRequired)
  }

  app.config.globalProperties.$hasLicense = function() {
    return this.$store.getters.hasValidLicense
  }

  app.config.globalProperties.$isRootOrg = function() {
    return this.$store.getters.currentOrgIsRoot
  }
}

export default {
  install: installPermissionDirective
}
