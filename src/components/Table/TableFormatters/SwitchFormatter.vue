<template>
  <div v-if="display">
    <el-switch v-model="value" @change="onChange" />
  </div>
  <span v-else>-</span>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'SwitchFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getPatchUrl(row) {
            return ''
          },
          getPatchData(row) {
            return {}
          },
          isDisplay(row) {
            return true
          },
          callback({ row }) {
            return null
          }
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      value: this.cellValue
    }
  },
  computed: {
    patchUrl() {
      return this.formatterArgs.getPatchUrl(this.row)
    },
    patchData() {
      return this.formatterArgs.getPatchData(this.row)
    },
    display(row) {
      return this.formatterArgs.isDisplay(this.row)
    }
  },
  methods: {
    onChange(val) {
      this.$axios.patch(this.patchUrl, this.patchData).then(res => {
        this.formatterArgs.callback(this.row)
        this.$message.success(this.$t('UpdateSuccessMsg'))
      }).catch(err => {
        this.value = !val
        this.$message.error(this.$t('UpdateErrorMsg' + ' ' + err))
      })
    }
  }
}
</script>

<style scoped>

</style>
