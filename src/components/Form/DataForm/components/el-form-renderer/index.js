// Import vue component
import Component from './el-form-renderer.vue'

// Vue 3 plugin install
Component.install = (app) => {
  app.component(Component.name, Component)
}

// To allow use as module (npm/webpack/etc.) export component
export default Component
