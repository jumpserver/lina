<template>
  <span v-if="attr.type === 'bool'">
    <i v-if="value" class="fa fa-check text-primary" />
    <i v-else class="fa fa-times text-danger" />
  </span>
  <span v-else :title="value">
    {{ value }}
  </span>
</template>

<script>
import BaseFormatter from '@/components/TableFormatters/base.vue'
import { setUrlParam } from '@/utils/common'

export default {
  name: 'ValueFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          attrs: {}
        }
      }
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    return {
      formatterArgs: formatterArgs,
      loading: true,
      attr: {},
      value: ''
    }
  },
  computed: {
  },
  watch: {
    cellValue: {
      handler(val) {
        this.getValue()
      },
      deep: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.getValue()
    }, 10)
  },
  methods: {
    async getValue() {
      this.attr = this.formatterArgs.attrs.find(attr => attr.name === this.row.name)
      this.match = this.row.match
      this.$log.debug('ValueFormatter: ', this.attr, this.row.name)
      console.log('ValueFormatter: ', { row: this.row, col: this.col, cellValue: this.cellValue, args: this.formatterArgs })
      console.log('attr: ', this.attr)
      if (this.attr.type === 'm2m') {
        const url = setUrlParam(this.attr.el.url, 'ids', this.cellValue.join(','))
        const data = await this.$axios.get(url) || []
        if (data.length > 0) {
          const displayField = this.attr.el.displayField || 'name'
          this.value = data.map(item => item[displayField]).join(', ')
        }
      } else if (this.attr.type === 'select') {
        this.value = this.attr.el.options
          .filter(item => this.cellValue.includes(item.value))
          .map(item => item.label)
          .join(', ')
      } else if (['in', 'ip_in'].includes(this.match)) {
        this.value = this.cellValue.join(', ')
      } else {
        this.value = this.cellValue
      }
      console.log('Value: ', this.value)
    }
  }
}
</script>

<style scoped>

</style>
