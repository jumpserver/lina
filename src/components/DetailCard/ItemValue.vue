<script type="text/jsx">
export default {
  name: 'ItemValue',
  props: {
    value: {
      type: [String, Number, Function, Array, Object, Boolean],
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
  methods: {
    toChoicesDisplay(value) {
      if (!value) {
        return this.$t('common.No')
      }
      return this.$t('common.Yes')
    }
  },
  render(h) {
    if (typeof this.formatter === 'function') {
      return this.formatter(this.item, this.value)
    }
    if (typeof this.value === 'boolean') {
      return (
        <span class='item-value'>{this.toChoicesDisplay(this.value)}</span>
      )
    }
    if (this.value instanceof Array) {
      const newArr = this.value || []
      return (
        <span class='item-value'>
          {
            newArr.map((item, index) => <div key={index}>{item.key}：{item.value} </div>)
          }
        </span>
      )
    }
    return (
      <span class='item-value'>{this.value}</span>
    )
  }
}
</script>

<style scoped>
.item-value {
  word-break: break-word;
}

</style>
