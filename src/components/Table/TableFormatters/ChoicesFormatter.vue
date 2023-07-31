<template>
  <span>
    <el-tooltip v-if="shown" :disabled="!formatterArgs.hasTips" effect="dark" placement="bottom">
      <div slot="content" v-html="tips" />
      <span :class="classes">
        <i v-if="formatterArgs.showIcon && icon" :class="'fa ' + icon" />
        <span v-if="formatterArgs.showText">{{ text }}</span>
      </span>
    </el-tooltip>
    <span v-else>-</span>
  </span>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'ChoicesFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          faChoices: {
            true: 'fa-check-circle',
            false: 'fa-times-circle'
          },
          classChoices: {
            true: 'text-primary',
            false: 'text-danger'
          },
          textChoices: {
            true: this.$t('common.Yes'),
            false: this.$t('common.No')
          },
          getKey({ row, cellValue }) {
            return (cellValue && typeof cellValue === 'object') ? cellValue.value : cellValue
          },
          getText({ row, cellValue }) {
            const key = this.getKey({ row, cellValue })
            return (cellValue && typeof cellValue === 'object') ? cellValue.label : this.textChoices[key] || cellValue
          },
          getIcon({ row, cellValue }) {
            const key = this.getKey({ row, cellValue })
            return this.faChoices[key]
          },
          hasTips: false,
          showIcon: true,
          showText: true,
          showFalse: true,
          getTips: ({ row, cellValue }) => {
            return cellValue
          }
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    key() {
      return this.formatterArgs.getKey(
        { row: this.row, cellValue: this.cellValue }
      )
    },
    icon() {
      const icon = this.formatterArgs.getIcon(
        { row: this.row, cellValue: this.cellValue }
      )
      return icon
    },
    classes() {
      return this.formatterArgs.classChoices[this.key]
    },
    text() {
      return this.formatterArgs.getText(
        { row: this.row, cellValue: this.cellValue }
      )
    },
    tips() {
      return this.formatterArgs.getTips({ cellValue: this.cellValue, row: this.row })
    },
    shown() {
      if (!this.formatterArgs.showFalse && !this.key) {
        return false
      }
      return true
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
