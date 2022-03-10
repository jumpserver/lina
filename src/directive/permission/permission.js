import { hasPermission } from '@/utils/jms'

function checkPermission(el, binding) {
  const { value } = binding

  if (!hasPermission(value)) {
    el.parentNode && el.parentNode.removeChild(el)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
