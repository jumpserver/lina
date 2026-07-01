import { installPermissionDirective } from './permission'

export function installDirectives(app) {
  installPermissionDirective(app)
}

export default {
  install: installDirectives
}
