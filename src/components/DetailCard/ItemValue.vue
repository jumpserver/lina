<script>
export default {
  name: 'ItemValue',
  props: {
    value: {
      type: [String, Function, Array],
      default: ''
    },
    item: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function
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
