import { getDatetimeFilters } from './datetime'

export function installFilters(app) {
  const filters = {
    ...getDatetimeFilters()
  }
  app.config.globalProperties.$filters = {
    ...(app.config.globalProperties.$filters || {}),
    ...filters
  }
}

export default {
  install: installFilters
}
