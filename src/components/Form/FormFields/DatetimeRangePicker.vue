<template>
  <el-date-picker
    v-model="value"
    :clearable="false"
    :default-time="['00:00:01', '23:59:59']"
    :end-placeholder="$tc('DateEnd')"
    :picker-options="pickerOptions"
    :start-placeholder="$tc('DateStart')"
    :type="type"
    class="datepicker"
    range-separator="-"
    size="small"
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
    },
    type: {
      type: String,
      default: 'daterange'
      // default: 'datetimerange'
    },
    toMinMax: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const startValue = this.dateStart || this.$route.query['date_start']
    const endValue = this.dateEnd || this.$route.query['date_end']
    const dateStart = new Date(startValue)
    const dateTo = new Date(endValue)
    if (this.toMinMax) {
      dateStart.setHours(0, 0, 0, 0)
      dateTo.setHours(23, 59, 59, 999)
    }
    return {
      value: [dateStart, dateTo],
      pickerOptions: {
        shortcuts: [
          {
            text: this.$t('DateLast24Hours'),
            onClick: (picker) => this.onShortcutClick(picker, 1)
          },
          {
            text: this.$t('DateLastWeek'),
            onClick: (picker) => this.onShortcutClick(picker, 7)
          }, {
            text: this.$t('DateLastMonth'),
            onClick: (picker) => this.onShortcutClick(picker, 30)
          }, {
            text: this.$t('DateLast3Months'),
            onClick: (picker) => this.onShortcutClick(picker, 90)
          }, {
            text: this.$t('DateLastHarfYear'),
            onClick: (picker) => this.onShortcutClick(picker, 183)
          }, {
            text: this.$t('DateLastYear'),
            onClick: (picker) => this.onShortcutClick(picker, 365)
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
    },
    onShortcutClick(picker, day) {
      let start = new Date()
      let end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * day)
      if (this.toMinMax) {
        start = new Date(start.setHours(0, 0, 0, 0))
        end = new Date(end.setHours(23, 59, 59, 999))
      }
      picker.$emit('pick', [start, end])
    }
  }
}
</script>

<style lang='scss' scoped>
html:lang(pt-br) {
  .datepicker ::v-deep .el-range-separator {
    padding: 0 10px;
  }
}

.datepicker {
  &.el-date-editor--daterange.el-input__inner {
    width: 243px;
  }

  margin-left: 10px;
  border: 1px solid #dcdee2;
  border-radius: 2px;
  height: 28px;

  ::v-deep .el-range-separator,
  ::v-deep .el-input__icon {
    line-height: 26px;
    color: var(--color-icon-primary) !important;
  }

  ::v-deep .el-range-input {
    color: var(--color-text-primary) !important;
  }

  ::v-deep .el-range-input {
    width: 49%;
  }
}
</style>
