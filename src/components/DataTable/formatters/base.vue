<template>

</template>

<script>
export default {
  name: 'BaseFormatter',
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    col: {
      type: Object,
      default: () => ({})
    },
    cellValue: {
      type: [String, Boolean, Number, Object],
      default: null
    }
  }
}
</script>

<style scoped>

</style>
