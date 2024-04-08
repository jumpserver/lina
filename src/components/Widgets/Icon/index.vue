<script>
export default {
  name: 'Index',
  props: {
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>

<template>
  <span>
    <i v-if="icon.startsWith('fa')" :class="'fa ' + icon" />
    <i v-else-if="icon.startsWith('el')" :class="icon" />
    <svg-icon v-else :icon-class="icon" />
  </span>
</template>

<style scoped>

</style>
