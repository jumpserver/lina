<template>
  <span :class="cls"> {{ value }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
export default {
  name: 'DisplayFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          displayKey: this.col.prop + '_display'
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    value() {
      const displayKey = this.formatterArgs.displayKey
      let value = this.row[displayKey]
      if (value === undefined) {
        value = this.row[this.col.prop]
      }
      return value
    },
    cls() {
      const classChoices = this.formatterArgs?.classChoices
      if (!classChoices) {
        return ''
      }
      return classChoices[this.cellValue]
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
