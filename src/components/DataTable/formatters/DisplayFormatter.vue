<template>
  <span>{{ display }}</span>
</template>

<script>
export default {
  name: 'DisplayFormatter',
  props: {
    col: Object,
    row: Object
  },
  data() {
    let displayKey = this.col.displayKey
    if (!displayKey) {
      displayKey = this.col.prop + '_display'
    }
    return {
      display: this.row[displayKey]
    }
  }
}
</script>

<style scoped>

</style>
