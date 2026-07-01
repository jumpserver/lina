import Vue from 'vue'
import DOMPurify from 'dompurify'

const FILTER_INLINE = {
  ALLOWED_TAGS: ['a', 'b', 'br', 'code', 'em', 'i', 'span', 'strike', 'strong', 'u'],
  ALLOWED_ATTR: ['class', 'href', 'rel', 'style', 'target']
}

const FILTER_NOTHING = {
  ALLOWED_TAGS: false,
  ALLOWED_ATTR: false
}

const FILTER_STRIP = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: []
}

function sanitizeHtml(value, options) {
  return DOMPurify.sanitize(value || '', options)
}

function resolveOptions(binding, defaults) {
  if (Array.isArray(binding.value)) {
    return {
      options: binding.value[0] || defaults,
      value: binding.value[1]
    }
  }

  if (binding.modifiers.strip) {
    return { options: FILTER_STRIP, value: binding.value }
  }

  if (binding.modifiers.inline) {
    return { options: FILTER_INLINE, value: binding.value }
  }

  if (binding.modifiers.nothing) {
    return { options: FILTER_NOTHING, value: binding.value }
  }

  return { options: defaults, value: binding.value }
}

function updateElement(el, binding, defaults) {
  const { options, value } = resolveOptions(binding, defaults)
  el.innerHTML = sanitizeHtml(value, options)
}

const defaultOptions = {
  ALLOWED_ATTR: ['class', 'href', 'rel', 'src', 'style', 'target', 'title']
}

Vue.prototype.$sanitize = (dirty, options = defaultOptions) => sanitizeHtml(dirty, options)

Vue.directive('sanitize', {
  bind(el, binding) {
    updateElement(el, binding, defaultOptions)
  },
  update(el, binding) {
    if (binding.value !== binding.oldValue) {
      updateElement(el, binding, defaultOptions)
    }
  }
})
