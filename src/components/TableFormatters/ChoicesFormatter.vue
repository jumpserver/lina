<template>
  <div>
    <el-tooltip v-if="formatterArgs.hasTips" placement="bottom" effect="dark">
      <div slot="content" v-html="tips" />
      <i :class="'fa ' + iconClass" />
    </el-tooltip>
    <i v-else :class="'fa ' + iconClass" />
  </div>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ChoicesFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          iconChoices: {
            true: 'fa-check text-primary',
            false: 'fa-times text-danger'
          },
          getIconKey({ row, cellValue }) {
            return cellValue
          },
          hasTips: false,
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
    iconClass() {
      const key = this.formatterArgs.getIconKey({ row: this.row, cellValue: this.cellValue })
      console.log('What key: ', key)
      return this.formatterArgs.iconChoices[key]
    },
    tips() {
      return this.formatterArgs.getTips({ cellValue: this.cellValue, row: this.row })
    }
  }
}
</script>

<style scoped>

</style>
