<template>
  <div>
    <el-tooltip v-if="formatterArgs.hasTips" :content="tips" placement="bottom" effect="dark">
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
          typeChange(val) {
            return !!val
          },
          hasTips: false,
          tips(val) {
            return val.datetime
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
      const key = this.formatterArgs.typeChange(this.cellValue)
      return this.formatterArgs.iconChoices[key]
    },
    tips() {
      return this.formatterArgs.tips(this.cellValue)
    }
  }
}
</script>

<style scoped>

</style>
