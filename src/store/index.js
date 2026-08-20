import { createStore } from 'vuex'
import getters from './getters'
import { setStore } from './registry'

const moduleFiles = import.meta.glob('./modules/**/*.js', {
  eager: true
})

const modules = Object.entries(moduleFiles).reduce((allModules, [modulePath, moduleValue]) => {
  const moduleName = modulePath.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')
  allModules[moduleName] = moduleValue.default
  return allModules
}, {})

const store = createStore({
  modules,
  getters
})

setStore(store)

export default store
