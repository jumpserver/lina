// Import vue component
import Component from './el-form-renderer.vue'

// `Vue.use` automatically prevents you from using
// the same plugin more than once,
// so calling it multiple times on the same plugin
// will install the plugin only once
Component.install = Vue => {
  Vue.component(Component.name, Component)
}

// To auto-install when vue is found
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(Component)
}

// To allow use as module (npm/webpack/etc.) export component
export default Component

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
