<template>
</template>

<script>
export default {
  name: 'BaseFormatter',
  props: {
    reload: {
      type: Function,
      default: ({reloading}) => ({})
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
      type: [String, Boolean, Number, Object],
      default: null
    },
    tableData: {
      type: Array,
      default: () => ({})
    }
  }
}
</script>

<style scoped>

</style>
