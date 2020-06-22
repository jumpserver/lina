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
          tips(val, vm) {
            if (val.status === 0) {
              return vm.$t('assets.Unreachable')
            } else if (val.status === 1) {
              return vm.$t('assets.Reachable')
            } else if (val.status === 2) {
              return vm.$t('assets.Unknown')
            }
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
      const vm = this
      return this.formatterArgs.tips(this.cellValue, vm)
    }
  }
}
</script>

<style scoped>

</style>
