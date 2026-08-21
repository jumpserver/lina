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
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'
import { setUrlParam } from '@/utils/common/index'

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
  watch: {
    cellValue: {
      handler() {
        this.getValue()
      },
      deep: true
    },
    formatterArgs: {
      handler() {
        this.getValue()
      },
      deep: true
    },
    row: {
      handler() {
        this.getValue()
      },
      deep: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.getValue()
    }, 100)
  },
  methods: {
    async getValue() {
      this.attr = this.formatterArgs.attrs.find((attr) => attr.name === this.row.name)
      if (!this.attr) {
        this.value = ''
        return
      }
      const match = this.row.match
      this.$log.debug('ValueFormatter: ', this.attr, this.row.name)
      if (this.attr.type === 'm2m') {
        const ids = Array.isArray(this.cellValue) ? this.cellValue.filter(Boolean) : []
        // 空的 ids 参数会被资源接口解释为未筛选，进而返回全部选项。属性规则的空值
        // 应保持为空，而不能在列表中显示为已选择全部值。
        if (ids.length === 0) {
          this.value = ''
          return
        }
        const url = setUrlParam(this.attr.el.url, 'ids', ids.join(','))
        const data = (await this.$axios.get(url)) || []
        if (data.length > 0) {
          if (this.attr.name === 'labels') {
            this.value = data.map((item) => `${item.name}:${item.value}`).join(', ')
          } else {
            const displayField = this.attr.el.displayField || 'name'
            this.value = data.map((item) => item[displayField]).join(', ')
          }
        }
      } else if (this.attr.type === 'select') {
        const options = this.attr.el.options || []
        const items = options.filter((item) => this.cellValue.includes(item.value))
        this.value = items.map((item) => item.label).join(', ')
      } else if (['in', 'ip_in'].includes(match)) {
        this.value = this.cellValue.join(', ')
      } else {
        this.value = this.cellValue
      }
    }
  }
}
</script>

<style scoped></style>
