<template>
  <i v-if="icon && icon.startsWith('fa-')" :class="`fa ${icon}`" />
  <svg-icon v-else-if="icon" :icon-class="icon" />
  <span v-if="title" class="item-title">{{ title }}</span>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
