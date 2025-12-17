import { installPermissionDirective } from './permission'
import { installAsyncDirective } from './async'
import { installDrawerDragDirective } from './drawer-drag'

export function installDirectives(app) {
  installPermissionDirective(app)
  installAsyncDirective(app)
  installDrawerDragDirective(app)
}

export default {
  install: installDirectives
}
