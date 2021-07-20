<template>
  <p class="item-value">{{ iValue }}</p>
</template>
<script>
export default {
  name: 'ItemValue',
  props: {
    value: {
      type: [String, Number, Function, Array, Object],
      default: ''
    },
    item: {
      type: Object,
      default: () => ({})
    },
    formatter: {
      type: Function,
      default: null
    }
  },
  computed: {
    iValue() {
      let value = this.value
      if (typeof this.formatter === 'function') {
        value = this.formatter(this.item, this.value)
      }
      return value
    }
  }
}
</script>

<style scoped>
.item-value {
  word-break: break-word;
}

</style>
