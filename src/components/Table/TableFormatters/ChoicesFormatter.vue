<template>
  <span>
    <el-tooltip v-if="shown" :disabled="!formatterArgs.hasTips" :open-delay="500" effect="dark" placement="bottom">
      <div slot="content" v-sanitize="tips" />
      <span :class="classes">
        <i v-if="formatterArgs.showIcon && icon" :class="'fa ' + icon" />
        <span v-if="formatterArgs.showText">{{ text }}</span>
      </span>
    </el-tooltip>
    <span v-else>-</span>
  </span>
</template>

<script>
import i18n from '@/i18n/i18n'
import BaseFormatter from './base.vue'

const formatterArgsDefault = {
  faChoices: {
    true: 'fa-check-circle',
    false: 'fa-times-circle'
  },
  classChoices: {
    true: 'text-primary',
    false: 'text-danger'
  },
  getKey({ row, cellValue }) {
    return (cellValue && typeof cellValue === 'object') ? cellValue.value : cellValue
  },
  getText({ row, cellValue }) {
    const key = this.getKey({ row, cellValue })
    if (cellValue && typeof cellValue === 'object') {
      return cellValue.label
    }
    if (key === true || key === 'true') return i18n.t('Yes')
    if (key === false || key === 'false') return i18n.t('No')
    return cellValue
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

export default {
  name: 'ChoicesFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return { ...formatterArgsDefault }
      }
    }
  },
  formatterArgsDefault: formatterArgsDefault,
  data() {
    return {
      formatterArgs: Object.assign({}, this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    key() {
      const k = this.formatterArgs.getKey(
        { row: this.row, cellValue: this.cellValue }
      )
      return k
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
