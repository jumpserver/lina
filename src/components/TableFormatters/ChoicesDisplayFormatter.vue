<template>
  <el-tooltip v-if="shown" :disabled="!formatterArgs.hasTips" placement="bottom" effect="dark">
    <div slot="content" v-html="tips" />
    <span :class="classes">
      <i v-if="formatterArgs.useIcon" :class="'fa ' + icon" />
      <span v-if="formatterArgs.useText">{{ text }}</span>
    </span>
  </el-tooltip>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ChoicesDisplayFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          iconChoices: {
          },
          classChoices: {
          },
          hasTips: false,
          useIcon: false,
          useText: true,
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
      return this.cellValue['value']
    },
    icon() {
      return this.formatterArgs.iconChoices[this.key] || ''
    },
    classes() {
      return this.formatterArgs.classChoices[this.key] || ''
    },
    text() {
      return this.cellValue['label']
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
  }
}
</script>

<style scoped>

</style>
