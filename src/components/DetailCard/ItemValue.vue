<script>
export default {
  name: 'ItemValue',
  props: {
    value: {
      type: [String, Function],
      default: ''
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    if (typeof this.value === 'function') {
      return this.value(this.item)
    }
    return <span>{this.value}</span>
  }
}
</script>

<style scoped>

</style>
