<script type="text/jsx">
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
  render(h) {
    if (typeof this.formatter === 'function') {
      return this.formatter(this.item, this.value)
    }
    return <span>{this.value}</span>
  }
}
</script>

<style scoped>

</style>
