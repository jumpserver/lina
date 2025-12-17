import { hasPermission } from '@/utils/jms/index'

function checkPermission(el, binding) {
  const { value } = binding

  if (!hasPermission(value)) {
    el.parentNode && el.parentNode.removeChild(el)
  }
}

export default {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  }
}
