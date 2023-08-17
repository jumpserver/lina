<template>
  <div>
    <el-tooltip v-if="formatterArgs.hasTips" placement="bottom" effect="dark">
      <div slot="content">
        <template v-if="tipsIsArray">
          <div v-for="tip of tips" :key="tip">
            <span>{{ tip }}</span>
            <br>
          </div>
        </template>
        <span v-else>
          {{ tips }}
        </span>
      </div>
      <i :class="'fa ' + iconClass" />
    </el-tooltip>
    <i v-else :class="'fa ' + iconClass" />
  </div>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'StatusFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          faChoices: {
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
      return this.formatterArgs.faChoices[key] + ' ' + key + 'Status'
    },
    tips() {
      const vm = this
      return this.formatterArgs.getTip(this.cellValue, vm)
    },
    tipsIsArray() {
      return Array.isArray(this.tips)
    }
  }
}
</script>

<style scoped>

</style>
