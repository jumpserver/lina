<template>
  <div />
</template>

<script>
export default {
  name: 'BaseFormatter',
  props: {
    reload: {
      type: Function,
      default: ({ reloading }) => ({})
    },
    row: {
      type: Object,
      default: () => ({})
    },
    col: {
      type: Object,
      default: () => ({})
    },
    cellValue: {
      type: [String, Boolean, Number, Object, Array],
      default: null
    },
    tableData: {
      type: Array,
      default: () => ({})
    },
    url: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>

</style>
