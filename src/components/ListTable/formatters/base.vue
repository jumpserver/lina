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
    },
    column: {
      type: Object,
      default: null
    },
    index: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>

</style>
