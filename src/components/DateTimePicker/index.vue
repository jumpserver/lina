<template>
  <el-date-picker
    v-model="value"
    type="daterange"
    :range-separator="this.$t('common.To')"
    :start-placeholder="this.$t('common.StartDate')"
    :end-placeholder="this.$t('common.StartDate')"
    align="center"
    size="large"
    :clearable="false"
    class="datepicker"
    :picker-options="pickerOptions"
    value-format="yyyy-MM-ddThh:mm"
    :default-time="['12:00:00', '12:00:00']"
    v-bind="$attrs"
    @change="handleDateChange"
    v-on="$listeners"
  />
</template>

<script>

import { formatDate } from '@/utils/common'

export default {
  name: '',
  components: {},
  data() {
    return {
      value: [formatDate((new Date().getTime()) - 432000000), formatDate(new Date().getTime())],
      pickerOptions: {
        shortcuts: [
          {
            text: this.$t('common.DateLastWeek'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: this.$t('common.DateLastMonth'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: this.$t('common.DateLast3Months'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {
    handleDateChange(val) {
      this.$emit('dateChange', val)
    }
  }
}
</script>

<style lang='less' scoped>
  .datepicker{
    width: 280px;
  }
  .el-input__inner{
    border: 1px solid #dcdee2;
    border-radius: 3px;
    height: 36px;
  }
  .el-date-editor /deep/ .el-input__icon{
    line-height: 28px;
  }
  .el-date-editor /deep/ .el-range-separator{
    line-height: 28px;
  }
</style>
