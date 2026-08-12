<script>
import { legacyIconComponents } from '@/icons/legacy-icon-map'

export default {
  name: 'Icon',
  props: {
    icon: {
      type: String,
      default: ''
    }
  },
  computed: {
    faIconClasses() {
      const classes = this.icon.split(/\s+/).filter(Boolean)
      const hasStyle = ['fa-solid', 'fa-regular', 'fa-brands', 'fas', 'far', 'fab'].some((style) =>
        classes.includes(style)
      )
      if (!hasStyle) {
        classes.unshift('fa-regular')
      }
      return [...new Set(['fa', ...classes])]
    },
    elIconComponent() {
      return legacyIconComponents[this.icon] || null
    }
  }
}
</script>

<template>
  <span>
    <i v-if="icon.startsWith('fa')" :class="faIconClasses" />
    <template v-else-if="icon.startsWith('el')">
      <el-icon v-if="elIconComponent"><component :is="elIconComponent" /></el-icon>
      <i v-else :class="icon" />
    </template>
    <svg-icon v-else :icon-class="icon" />
  </span>
</template>

<style scoped></style>
