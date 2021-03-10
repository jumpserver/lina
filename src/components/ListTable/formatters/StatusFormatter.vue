<template>
  <div>
    <el-tooltip v-if="formatterArgs.hasTips" placement="bottom" effect="dark">
      <div slot="content">{{ tips }}</div>
      <i :class="'fa ' + iconClass" />
    </el-tooltip>
    <i v-else :class="'fa ' + iconClass" />
  </div>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'StatusFormatter',
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
          getChoicesKey(val) {
            return !!val
          },
          getTip(val, col) {
          },
          hasTips: false
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
      const key = this.formatterArgs.getChoicesKey(this.cellValue)
      return this.formatterArgs.iconChoices[key]
    },
    tips() {
      const vm = this
      return this.formatterArgs.getTip(this.cellValue, vm)
    }
  }
}
</script>

<style scoped>

</style>
