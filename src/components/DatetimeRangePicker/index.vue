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
    :value-format="valueFormatter"
    :default-time="['00:00:01', '23:59:59']"
    v-bind="$attrs"
    @change="handleDateChange"
    v-on="$listeners"
  />
</template>

<script>
import { formatDate } from '@/utils/common'
export default {
  name: 'DatetimeRangePicker',
  components: {},
  props: {
    startValue: {
      type: Number,
      default: null
    },
    endValue: {
      type: Number,
      default: null
    }
  },
  data() {
    const startValue = this.startValue || this.$route.query['date_start']
    const endValue = this.$route.query['date_end']
    const dateStart = new Date(startValue)
    const dateTo = new Date(endValue)
    return {
      valueFormatter: 'yyyy-MM-ddTHH:mm:ss',
      value: [startValue ? formatDate(dateStart) : '', endValue ? formatDate(dateTo) : ''],
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
    width: 235px;
  }
  .el-input__inner{
    border: 1px solid #dcdee2;
    border-radius: 3px;
    height: 36px;
  }
  /*.el-date-editor /deep/ .el-input__icon{*/
  /*  line-height: 28px;*/
  /*}*/
  .el-date-editor /deep/ .el-range-separator{
    line-height: 28px;
  }
</style>
