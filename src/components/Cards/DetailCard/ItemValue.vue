<script type="text/jsx">
import { toSafeLocalDateStr } from '@/utils/common'

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
  data() {
    return {}
  },
  computed: {
    displayValue() {
      if ([null, undefined, ''].includes(this.value)) {
        return '-'
      }
      if (typeof this.value === 'boolean') {
        return this.toChoicesDisplay(this.value)
      } else if (typeof this.value === 'object') {
        return this.value
      } else if (this.value instanceof Array) {
        return this.value.map(item => {
          if (typeof item === 'object') {
            return item.label || item.title
          } else {
            return item
          }
        }).join(', ')
      } else if (this.isDatetime(this.value)) {
        return toSafeLocalDateStr(this.value)
      } else {
        return this.value
      }
    }
  },
  methods: {
    toChoicesDisplay(value) {
      if (!value) {
        return this.$t('common.No')
      }
      return this.$t('common.Yes')
    },
    isDatetime(value) {
      if (typeof value !== 'string') {
        return false
      }
      if (value.split(' ').length !== 3) {
        return false
      }
      if (value.split(' ')[1].split(':').length !== 3) {
        return false
      }
      if (isNaN(value) && !isNaN(Date.parse(value))) {
        return true
      }
    }
  },
  render(h) {
    let formatterData = ''
    if (typeof this.formatter === 'function') {
      const data = this.formatter(this.item, this.value)
      if (data instanceof Promise) {
        data.then(res => {
          formatterData = res
        })
      } else {
        formatterData = data
      }
      return (
        <span>{formatterData}</span>
      )
    }
    if (this.value instanceof Array) {
      const newArr = this.value || []
      return (
        <span>
          {
            newArr.map((item, index) => <div key={index}>{item.key}：{item.value} </div>)
          }
        </span>
      )
    }
    return (
      <span>{this.displayValue}</span>
    )
  }
}
</script>

<style scoped>
a {
  color: var(--color-success);
}
</style>
