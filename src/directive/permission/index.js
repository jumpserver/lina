import {
  getCurrentResActionPerms,
  hasApiActionPerm,
  hasCurrentResAction,
  hasLicense,
  hasPerm,
  isRootOrg
} from '@/composables/usePermission'

export function installPermissionDirective(app) {
  app.config.globalProperties.$hasPerm = hasPerm
  app.config.globalProperties.$hasApiActionPerm = hasApiActionPerm

  app.config.globalProperties.$getCurrentResActionPerms = function (action) {
    return getCurrentResActionPerms(this.$route, action)
  }

  app.config.globalProperties.$hasCurrentResAction = function (action) {
    return hasCurrentResAction(this.$route, action)
  }

  app.config.globalProperties.$hasLicense = function () {
    return hasLicense(this.$store)
  }

  app.config.globalProperties.$isRootOrg = function () {
    return isRootOrg(this.$store)
  }
}

export default {
  install: installPermissionDirective
}
