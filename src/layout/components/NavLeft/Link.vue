<template>
  <!-- Use dynamic component with explicit :is to support Vue 3 -->
  <component v-bind="attrs" :is="tag">
    <slot />
  </component>
</template>

<script>
import { isExternal } from '@/utils/secure'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  computed: {
    tag() {
      return 'a'
    },
    attrs() {
      if (isExternal(this.to)) {
        return { href: this.to, target: '_blank', rel: 'noopener' }
      }
      return { href: `#${this.to}` }
    }
  }
}
</script>
