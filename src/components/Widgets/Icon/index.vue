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
      // Free 版大量图标仅 solid 可用；FA7 的 .fa 默认 weight 也是 900(solid)。
      // 未显式指定样式时默认 fa-solid，避免 fa-regular 导致 solid-only 图标空白。
      if (!hasStyle) {
        classes.unshift('fa-solid')
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
