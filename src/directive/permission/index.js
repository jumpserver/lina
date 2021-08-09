import permission from './permission'
import Vue from 'vue'

const install = function(Vue) {
  Vue.directive('perms', permission)
}

window['permission'] = permission
Vue.use(install); // eslint-disable-line

permission.install = install
export default permission
