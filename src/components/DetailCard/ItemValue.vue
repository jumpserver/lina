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
    callback: {
      type: Function,
      default: null
    }
  },
  render(h) {
    if (typeof this.callback === 'function') {
      return this.callback(this.item, this.value)
    }
    return <span>{this.value}</span>
  }
}
</script>

<style scoped>

</style>
