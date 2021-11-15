import { hasPermission, getRouteRequiredPerms } from '@/utils/jms'
import permission from './permission'
import Vue from 'vue'

const install = function(Vue) {
  Vue.directive('perms', permission)

  Vue.prototype.$hasPerm = function(perms) {
    return hasPermission(perms)
  }

  Vue.prototype.$getCurrentResActionPerms = function(action) {
    return getRouteRequiredPerms(this.$route.path, action)
  }

  Vue.prototype.$hasCurrentResAction = function(action) {
    const permsRequired = getRouteRequiredPerms(this.$route.path, action)
    return hasPermission(permsRequired)
  }

  Vue.prototype.$hasLicense = function() {
    return this.$store.getters.hasValidLicense
  }
}

window['permission'] = permission
Vue.use(install); // eslint-disable-line

permission.install = install
export default permission
