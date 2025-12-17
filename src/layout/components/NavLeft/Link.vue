
<template>
  <!-- Use dynamic component with explicit :is to support Vue 3 -->
  <component :is="tag" v-bind="attrs">
    <slot />
  </component>
  
</template>

<script>
import { isExternal } from '@/utils/secure'
import { RouterLink } from 'vue-router'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  computed: {
    tag() {
      return isExternal(this.to) ? 'a' : RouterLink
    },
    attrs() {
      if (isExternal(this.to)) {
        return { href: this.to, target: '_blank', rel: 'noopener' }
      }
      return { to: this.to }
    }
  }
}
</script>
