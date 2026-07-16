<script>
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { h } from 'vue'

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
        return this.value
          .map((item) => {
            if (typeof item === 'object') {
              return item.label || item.title
            } else {
              return item
            }
          })
          .join(', ')
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
        return this.$t('No')
      }
      return this.$t('Yes')
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
  render() {
    let formatterData = ''
    if (typeof this.formatter === 'function') {
      const data = this.formatter(this.item, this.value)
      if (data instanceof Promise) {
        data.then((res) => {
          formatterData = res
        })
      } else {
        formatterData = data
      }
      return h(
        'span',
        { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.2' } },
        [formatterData]
      )
    }
    if (this.value instanceof Array) {
      const newArr = this.value || []
      return h(
        'span',
        newArr.map((item, index) => h('div', { key: index }, `${item.key}：${item.value} `))
      )
    }
    return h(
      'span',
      {
        style: { whiteSpace: 'pre-wrap' },
        title: this.displayValue
      },
      this.displayValue
    )
  }
}
</script>

<style scoped>
/* 详情值里的链接用统一链接色（各主题皆蓝），而非 --color-success（Deep black 下为绿、语义也不对）。 */
a {
  color: var(--color-link);
}
</style>
