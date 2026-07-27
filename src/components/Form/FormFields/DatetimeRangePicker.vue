<template>
  <el-date-picker
    v-bind="$attrs"
    v-model="value"
    :clearable="false"
    :default-time="defaultTime"
    :end-placeholder="$tc('DateEnd')"
    :popper-options="popperOptions"
    :shortcuts="shortcuts"
    :start-placeholder="$tc('DateStart')"
    :type="type"
    class="datepicker"
    popper-class="datetime-range-picker-popper"
    range-separator="-"
    size="small"
    @change="handleDateChange"
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
    // 无有效初始值时置空，避免把 Invalid Date 绑进 v-model 导致面板异常、无法点选
    const hasValidRange = !isNaN(dateStart.getTime()) && !isNaN(dateTo.getTime())
    if (hasValidRange && this.toMinMax) {
      dateStart.setHours(0, 0, 0, 0)
      dateTo.setHours(23, 59, 59, 999)
    }
    return {
      value: hasValidRange ? [dateStart, dateTo] : null,
      // Element Plus 的 default-time 需要 Date 数组（起止各一个），不能用字符串
      defaultTime: [new Date(2000, 0, 1, 0, 0, 1), new Date(2000, 0, 1, 23, 59, 59)],
      popperOptions: {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              mainAxis: true,
              altAxis: true,
              tether: false,
              padding: 12
            }
          }
        ]
      },
      shortcuts: [
        { text: this.$t('DateLast24Hours'), value: () => this.rangeOfDays(1) },
        { text: this.$t('DateLastWeek'), value: () => this.rangeOfDays(7) },
        { text: this.$t('DateLastMonth'), value: () => this.rangeOfDays(30) },
        { text: this.$t('DateLast3Months'), value: () => this.rangeOfDays(90) },
        { text: this.$t('DateLastHarfYear'), value: () => this.rangeOfDays(183) },
        { text: this.$t('DateLastYear'), value: () => this.rangeOfDays(365) }
      ]
    }
  },
  mounted() {
    this.$log.debug('Datetime range picker value: ', this.value)
  },
  methods: {
    handleDateChange(val) {
      if (val && val[0]?.getTime() && val[1]?.getTime()) {
        this.$log.debug('Date change: ', val)
        this.$emit('dateChange', val)
      }
    },
    rangeOfDays(day) {
      let start = new Date()
      let end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * day)
      if (this.toMinMax) {
        start = new Date(start.setHours(0, 0, 0, 0))
        end = new Date(end.setHours(23, 59, 59, 999))
      }
      return [start, end]
    }
  }
}
</script>

<style lang="scss" scoped>
html:lang(pt-br) {
  .datepicker :deep(.el-range-separator) {
    padding: 0 10px;
  }
}

.datepicker {
  margin-left: 10px;
  border: 1px solid #dcdee2;
  border-radius: 2px;
  width: 243px !important;
  min-width: 243px !important;
  max-width: 243px !important;
  flex: 0 0 243px !important;
  display: inline-flex !important;
  align-items: center;
  align-self: flex-start;
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  box-sizing: border-box;
  background-color: #fff;

  :deep(.el-range-separator),
  :deep(.el-range__icon),
  :deep(.el-range__close-icon) {
    line-height: 30px;
    color: var(--color-icon-primary) !important;
  }

  :deep(.el-range-input) {
    height: 30px;
    line-height: 30px;
    color: var(--color-text-primary) !important;
  }

  :deep(.el-range-input) {
    width: 49%;
  }
}
</style>

<style lang="scss">
// 日期面板 teleport 到 body，窄窗口下限制在视口内；双日历宽度超出时由浮层横向滚动。
.datetime-range-picker-popper.el-picker__popper {
  box-sizing: border-box;
  max-width: calc(100vw - 24px);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
}
</style>
