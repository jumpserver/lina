<template>
  <div class="cron-tab-field">
    <div class="box">
      <el-input v-model="input" clearable @clear="onClear" @focus="showDialog" />
    </div>
    <Dialog
      v-model:visible="showCron"
      class="cron-dialog"
      :show-buttons="false"
      :title="$tc('NewCron')"
      append-to-body
      top="8vh"
      width="650px"
    >
      <Crontab :expression="expression" @fill="crontabFill" @hide="showCron = false" />
    </Dialog>
  </div>
</template>

<script>
import Crontab from './Crontab.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  components: { Crontab, Dialog },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      input: _.cloneDeep(this.value),
      expression: _.cloneDeep(this.value),
      showCron: false
    }
  },
  watch: {
    value: {
      handler(val) {
        this.crontabFill(val)
      }
    }
  },
  methods: {
    crontabFill(value) {
      // 确定后回传的值
      this.input = value
      this.$emit('change', value)
    },
    showDialog() {
      this.expression = this.input
      this.showCron = true
    },
    onClear() {
      this.input = ''
      this.$emit('change', '')
    }
  }
}
</script>

<style lang="scss">
.cron-tab-field,
.cron-tab-field .box,
.cron-tab-field .el-input {
  width: 100%;
}

.cron-dialog .el-dialog__body {
  padding: 20px 24px 18px !important;
}
</style>
