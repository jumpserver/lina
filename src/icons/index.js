import SvgIcon from '@/components/Widgets/SvgIcon' // svg component

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)

export function installSvgIcon(app) {
  app.component('SvgIcon', SvgIcon)
  requireAll(req)
}

export default {
  install: installSvgIcon
}
