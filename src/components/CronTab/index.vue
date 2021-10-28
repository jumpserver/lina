<template>
  <div>
    <div class="box">
      <el-input v-model="input" clearable @focus="showDialog" @clear="onClear" />
    </div>
    <el-dialog :title="this.$t('common.CronTab.newCron')" :visible.sync="showCron" top="8vh" width="580px" append-to-body>
      <Crontab
        :expression="expression"
        @hide="showCron = false"
        @fill="crontabFill"
      />
    </el-dialog>
  </div>
</template>

<script>
import Crontab from './Crontab.vue'
export default {
  components: { Crontab },
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

<style scoped>
  .el-dialog__body {
    padding: 12px 16px;
}
</style>
