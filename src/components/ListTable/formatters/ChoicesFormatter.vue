<template>
  <div>
    <el-tooltip v-if="formatterArgs.hasTips" placement="bottom" effect="dark">
      <div slot="content">{{ tipStatus }}<br>{{ tipTime }}</div>
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
          tipStatus(val, vm) {
            if (val.status === 0) {
              return vm.$t('assets.Unreachable')
            } else if (val.status === 1) {
              return vm.$t('assets.Reachable')
            } else if (val.status === 2) {
              return vm.$t('assets.Unknown')
            }
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
    tipStatus() {
      const vm = this
      return this.formatterArgs.tipStatus(this.cellValue, vm)
    },
    tipTime() {
      return this.cellValue.datetime
    }
  }
}
</script>

<style scoped>

</style>
