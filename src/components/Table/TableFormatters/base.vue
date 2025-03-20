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
      default: () => ([])
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
    },
    formatterArgsDefault: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  methods: {
    cellValueIsLabelChoice() {
      return typeof this.cellValue === 'object' && this.cellValue['value'] !== undefined
    }
  }
}
</script>

<style scoped>

</style>
