import store from '@/store'

function checkPermission(el, binding) {
  const { value } = binding
  const perms = store.getters?.currentOrgPerms || []

  if (value && value instanceof Array) {
    if (value.length > 0) {
      const permsRequired = value

      const hasPermission = perms.some(perm => {
        return permsRequired.includes(perm)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need perms! Like v-permission="['assets.add_asset','assets.view_asset']"`)
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
