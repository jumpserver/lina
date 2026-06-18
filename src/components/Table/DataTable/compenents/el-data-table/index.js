// Import vue component
import component from './el-data-table.vue'

// Vue 3 plugin install
component.install = (app) => {
  app.component(component.name, component)
}

// To allow use as module (npm/webpack/etc.) export component
export default component
