<template>
  <el-date-picker
    v-model="value"
    type="datetimerange"
    :range-separator="this.$t('common.To')"
    :start-placeholder="this.$t('common.DateStart')"
    :end-placeholder="this.$t('common.DateEnd')"
    size="small"
    :clearable="false"
    class="datepicker"
    :picker-options="pickerOptions"
    :default-time="['00:00:01', '23:59:59']"
    v-bind="$attrs"
    @change="handleDateChange"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'DatetimeRangePicker',
  components: {},
  props: {
    dateStart: {
      type: [Number, String, Date],
      default: null
    },
    dateEnd: {
      type: [Number, String, Date],
      default: null
    }
  },
  data() {
    const startValue = this.dateStart || this.$route.query['date_start']
    const endValue = this.dateEnd || this.$route.query['date_end']
    const dateStart = new Date(startValue)
    const dateTo = new Date(endValue)
    return {
      value: [dateStart, dateTo],
      pickerOptions: {
        shortcuts: [
          {
            text: this.$t('common.DateLast24Hours'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          },
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
  mounted() {
    this.$log.debug('Datetime range picker value: ', this.value)
  },
  methods: {
    handleDateChange(val) {
      if (val[0].getTime() && val[1].getTime()) {
        this.$log.debug('Date change: ', val)
        this.$emit('dateChange', val)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  .datepicker{
    width: 233px;
    &>>> .el-range__icon {
      margin-top: 2px;
      margin-right: 3px;
    }
    &>>> .el-range-input {
      width: 49%;
    }
  }
  .el-input__inner{
    border: 1px solid #dcdee2;
    border-radius: 3px;
    height: 36px;
  }
  .el-date-editor  ::v-deep  .el-range-separator{
    line-height: 28px;
  }
</style>
