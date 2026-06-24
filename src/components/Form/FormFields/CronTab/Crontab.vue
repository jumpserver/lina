/* eslint-disable */
<template>
  <div class="crontab-root">
    <el-tabs class="tab-content">
      <el-tab-pane v-if="shouldHide('min')" :label="$tc('Min')" class="crontab-panel">
        <CrontabMin
          ref="cronmin"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('hour')" :label="$tc('Hour')">
        <CrontabHour
          ref="cronhour"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('day')" :label="$tc('Day')">
        <CrontabDay
          ref="cronday"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('month')" :label="$tc('Month')">
        <CrontabMonth
          ref="cronmonth"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('week')" :label="$tc('Week')">
        <CrontabWeek
          ref="cronweek"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>
    </el-tabs>

    <div class="popup-main">
      <div class="popup-result">
        <p class="title">{{ $t('TimeExpression') }}</p>
        <div class="cron-expression-grid">
          <div class="cron-expression-field">
            <label>{{ $t('Min') }}</label>
            <el-input
              v-model.trim="contabValueObj.min"
              max="5"
              min="0"
              onkeyup="value = value.replace(/[^\0-9\-\*\,]/g, '')"
              size="small"
            />
          </div>
          <div class="cron-expression-field">
            <label>{{ $t('Hour') }}</label>
            <el-input
              v-model.trim="contabValueObj.hour"
              onkeyup="value = value.replace(/[^\0-9\-\*\,]/g, '')"
              size="small"
            />
          </div>
          <div class="cron-expression-field">
            <label>{{ $t('Day') }}</label>
            <el-input
              v-model.trim="contabValueObj.day"
              onkeyup="value = value.replace(/[^\0-9\\-\*\,]/g, '')"
              size="small"
            />
          </div>
          <div class="cron-expression-field">
            <label>{{ $t('Month') }}</label>
            <el-input
              v-model.trim="contabValueObj.month"
              onkeyup="value = value.replace(/[^\0-9\-\*\,]/g, '')"
              size="small"
            />
          </div>
          <div class="cron-expression-field">
            <label>{{ $t('Week') }}</label>
            <el-input
              v-model.trim="contabValueObj.week"
              onkeyup="value = value.replace(/[^\0-9\-\*\,]/g, '')"
              size="small"
            />
          </div>
        </div>
        <CrontabResult :ex="contabValueString" @crontab-diff-change="crontabDiffChangeHandle" />
      </div>

      <div class="pop_btn">
        <el-button size="small" @click="clearCron">
          {{ $t('Reset') }}
        </el-button>
        <el-button size="small" type="primary" @click="submitFill">
          {{ $t('Confirm') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import CrontabMin from './components/Crontab-Min.vue'
import CrontabHour from './components/Crontab-Hour.vue'
import CrontabDay from './components/Crontab-Day.vue'
import CrontabMonth from './components/Crontab-Month.vue'
import CrontabWeek from './components/Crontab-Week.vue'
import CrontabResult from './components/Crontab-Result.vue'

export default {
  name: 'VCrontab',
  components: {
    CrontabMin,
    CrontabHour,
    CrontabDay,
    CrontabMonth,
    CrontabWeek,
    CrontabResult
  },
  props: {
    expression: {
      type: String,
      default() {
        return ''
      }
    },
    hideComponent: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      tabActive: 0,
      myindex: 0,
      contabValueObj: {
        second: '0',
        min: '0',
        hour: '*',
        day: '*',
        month: '*',
        week: '*'
        // year: "",
      },
      newContabValueString: '',
      crontabDiff: 0
    }
  },
  computed: {
    contabValueString: {
      get() {
        const obj = this.contabValueObj
        const str = obj.min + ' ' + obj.hour + ' ' + obj.day + ' ' + obj.month + ' ' + obj.week
        return str
      },
      set() {}
    }
  },
  watch: {
    expression: 'resolveExp',
    hideComponent(value) {
      // 隐藏部分组件
    }
  },
  mounted: function () {
    this.resolveExp()
  },
  methods: {
    shouldHide(key) {
      if (this.hideComponent && this.hideComponent.includes(key)) return false
      return true
    },
    resolveExp() {
      // 反解析 表达式
      if (this.expression) {
        const arr = this.expression.split(' ')
        if (arr.length >= 5) {
          // 5 位以上是合法表达式
          const obj = {
            min: arr[0],
            hour: arr[1],
            day: arr[2],
            month: arr[3],
            week: arr[4]
          }
          this.contabValueObj = {
            ...this.contabValueObj,
            ...obj
          }
          for (const i in obj) {
            if (obj[i]) this.changeRadio(i, obj[i])
          }
        }
      } else {
        // 没有传入的表达式 则还原
        this.clearCron()
      }
    },
    // tab切换值
    tabCheck(index) {
      this.tabActive = index
    },
    // 由子组件触发，更改表达式组成的字段值
    updateContabValue(name, value, from) {
      this.contabValueObj[name] = value
      if (from && from !== name) {
        // debug(`来自组件 ${from} 改变了 ${name} ${value}`)
        this.changeRadio(name, value)
      }
    },
    // 赋值到组件
    changeRadio(name, value) {
      const arr = ['second', 'min', 'hour', 'month']
      const refName = 'cron' + name
      let insVlaue

      if (!this.$refs[refName]) return

      if (arr.includes(name)) {
        if (value === '*') {
          insVlaue = 1
        } else if (value.indexOf('-') > -1) {
          const indexArr = value.split('-')
          isNaN(indexArr[0])
            ? (this.$refs[refName].cycle01 = 0)
            : (this.$refs[refName].cycle01 = indexArr[0])
          this.$refs[refName].cycle02 = indexArr[1]
          insVlaue = 2
        } else if (value.indexOf('/') > -1) {
          const indexArr = value.split('/')
          isNaN(indexArr[0])
            ? (this.$refs[refName].average01 = 0)
            : (this.$refs[refName].average01 = indexArr[0])
          this.$refs[refName].average02 = indexArr[1]
          insVlaue = 3
        } else {
          insVlaue = 4
          this.$refs[refName].checkboxList = value.split(',')
        }
      } else if (name === 'day') {
        if (value === '*') {
          insVlaue = 1
        } else if (value === '?') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          const indexArr = value.split('-')
          isNaN(indexArr[0])
            ? (this.$refs[refName].cycle01 = 0)
            : (this.$refs[refName].cycle01 = indexArr[0])
          this.$refs[refName].cycle02 = indexArr[1]
          insVlaue = 3
        } else if (value.indexOf('/') > -1) {
          const indexArr = value.split('/')
          isNaN(indexArr[0])
            ? (this.$refs[refName].average01 = 0)
            : (this.$refs[refName].average01 = indexArr[0])
          this.$refs[refName].average02 = indexArr[1]
          insVlaue = 4
        } else if (value.indexOf('W') > -1) {
          const indexArr = value.split('W')
          isNaN(indexArr[0])
            ? (this.$refs[refName].workday = 0)
            : (this.$refs[refName].workday = indexArr[0])
          insVlaue = 5
        } else if (value === 'L') {
          insVlaue = 6
        } else {
          this.$refs[refName].checkboxList = value.split(',')
          insVlaue = 7
        }
      } else if (name === 'week') {
        if (value === '*') {
          insVlaue = 1
        } else if (value === '?') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          const indexArr = value.split('-')
          isNaN(indexArr[0])
            ? (this.$refs[refName].cycle01 = 0)
            : (this.$refs[refName].cycle01 = indexArr[0])
          this.$refs[refName].cycle02 = indexArr[1]
          insVlaue = 3
        } else if (value.indexOf('#') > -1) {
          const indexArr = value.split('#')
          isNaN(indexArr[0])
            ? (this.$refs[refName].average01 = 1)
            : (this.$refs[refName].average01 = indexArr[0])
          this.$refs[refName].average02 = indexArr[1]
          insVlaue = 4
        } else if (value.indexOf('L') > -1) {
          const indexArr = value.split('L')
          isNaN(indexArr[0])
            ? (this.$refs[refName].weekday = 1)
            : (this.$refs[refName].weekday = indexArr[0])
          insVlaue = 5
        } else {
          this.$refs[refName].checkboxList = value.split(',')
          insVlaue = 6
        }
      } else if (name === 'year') {
        if (value === '') {
          insVlaue = 1
        } else if (value === '*') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          insVlaue = 3
        } else if (value.indexOf('/') > -1) {
          insVlaue = 4
        } else {
          this.$refs[refName].checkboxList = value.split(',')
          insVlaue = 5
        }
      }
      this.$refs[refName].radioValue = insVlaue
    },
    // 表单选项的子组件校验数字格式（通过-props传递）
    checkNumber(value, minLimit, maxLimit) {
      // 检查必须为整数
      value = Math.floor(value)
      if (value < minLimit) {
        value = minLimit
      } else if (value > maxLimit) {
        value = maxLimit
      }
      return value
    },
    // 隐藏弹窗
    hidePopup() {
      this.$emit('hide')
    },
    // 填充表达式
    submitFill() {
      const minMinutes = 60
      const crontabDiffMin = this.crontabDiff / 1000 / 60
      if (crontabDiffMin > 0 && crontabDiffMin < minMinutes) {
        const msg = this.$t('CrontabDiffError', { minutes: minMinutes })
        this.$message.error(msg)
        return
      }
      this.$emit('fill', this.contabValueString)
      this.hidePopup()
    },
    clearCron() {
      // 还原选择项
      this.contabValueObj = {
        second: '0',
        min: '0',
        hour: '0',
        day: '*',
        month: '*',
        week: '*'
        // year: "",
      }
      for (const j in this.contabValueObj) {
        this.changeRadio(j, this.contabValueObj[j])
      }
    },
    crontabDiffChangeHandle(diff) {
      this.crontabDiff = diff
    }
  }
}
</script>
<style lang="scss" scoped>
.pop_btn {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.popup-main {
  position: relative;
  margin: 0;
  background: #fff;
  font-size: 13px;
  overflow: hidden;
}

.popup-title {
  overflow: hidden;
  line-height: 34px;
  padding-top: 6px;
  background: #f2f2f2;
}

.popup-result {
  position: relative;
  box-sizing: border-box;
  line-height: 24px;
  margin: 24px auto 0;
  padding: 18px 16px 14px;
  border: 1px solid var(--el-border-color);
  background: #fff;
}

.popup-result .title {
  position: absolute;
  top: -17px;
  left: 50%;
  width: 140px;
  font-size: 14px;
  margin-left: -70px;
  text-align: center;
  line-height: 30px;
  background: #fff;
}

.cron-expression-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 10px;
}

.cron-expression-field {
  min-width: 0;

  label {
    display: block;
    margin-bottom: 6px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    color: var(--color-text-primary);
  }
}

.popup-result-scroll {
  font-size: 12px;
  line-height: 24px;
  height: 10em;
  overflow-y: auto;
}

:deep(.el-form-item) {
  &.el-form-item--small,
  &.el-form-item--small {
    margin-bottom: 5px;
  }

  .el-input-number {
    margin: 0 5px;
  }
}

:deep(.cron-tab-form) {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .el-form-item {
    margin-bottom: 0;
  }

  .el-form-item__content {
    min-height: 30px;
    line-height: 30px;
    align-items: center;
  }

  .el-radio {
    display: flex;
    align-items: center;
    margin-right: 0;
    line-height: 30px;
  }

  .el-radio__input {
    height: 30px;
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    transform: translateY(-2px);
  }

  .el-radio__label {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding-left: 8px;
    white-space: normal;
    min-height: 30px;
    line-height: 30px;
  }
}

:deep(.cron-tab-form__text) {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
}

:deep(.cron-tab-form__group) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  flex-wrap: wrap;
}

:deep(.cron-tab-form__separator) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  color: var(--color-text-primary);
}

:deep(.cron-tab-form__select) {
  width: 220px;
}

.crontab-root :deep(.el-input),
.crontab-root :deep(.el-select),
.crontab-root :deep(.el-input-number),
.crontab-root :deep(.el-input__wrapper),
.crontab-root :deep(.el-select__wrapper) {
  min-height: 30px;
  height: 30px;
}

.tab-content {
  position: relative;
  box-sizing: border-box;
  line-height: 24px;
  margin: 0 auto;
  padding: 12px 16px 14px;
  border: 1px solid var(--el-border-color);
  background: #fff;
}

.pop_btn :deep(.el-button) {
  min-height: 30px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
}

.crontab-root :deep(.el-input__wrapper),
.crontab-root :deep(.el-select__wrapper),
.crontab-root :deep(.el-input-number__increase),
.crontab-root :deep(.el-input-number__decrease) {
  border-radius: 0;
}

.crontab-root :deep(.el-input__wrapper),
.crontab-root :deep(.el-select__wrapper) {
  box-shadow: none !important;
  border: 1px solid var(--el-border-color) !important;
  background: #fff;
  padding: 0 11px;
  min-height: 30px;
  height: 30px;
  box-sizing: border-box;
}

.crontab-root :deep(.el-input__wrapper:hover),
.crontab-root :deep(.el-select__wrapper:hover) {
  border-color: var(--el-border-color-hover) !important;
}

.crontab-root :deep(.el-input__wrapper.is-focus),
.crontab-root :deep(.el-select__wrapper.is-focused) {
  box-shadow: none !important;
  border-color: var(--el-color-primary) !important;
}

.crontab-root :deep(.el-input__inner),
.crontab-root :deep(.el-select__selected-item),
.crontab-root :deep(.el-select__placeholder) {
  min-height: 28px;
  height: 28px;
  line-height: 28px;
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
}

.crontab-root :deep(.cron-tab-form__select .el-select__selection) {
  min-height: 28px;
  align-items: center;
}

.crontab-root :deep(.cron-tab-form__select .el-select__selected-item) {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
}

.crontab-root :deep(.cron-tab-form__select .el-tag) {
  height: 22px;
  line-height: 20px;
  margin: 0;
  display: inline-flex;
  align-items: center;
}

.crontab-root :deep(.cron-tab-form__select .el-tag__content) {
  display: inline-flex;
  align-items: center;
  line-height: 20px;
}

.crontab-root :deep(.cron-tab-form__number.el-input-number) {
  width: 132px;
  min-height: 30px;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  border-radius: 0;
  overflow: hidden;
  box-shadow: none !important;
  background: #fff;
}

.crontab-root :deep(.cron-tab-form__number.el-input-number:hover),
.crontab-root :deep(.cron-tab-form__number.el-input-number:focus-within) {
  border-color: var(--el-color-primary);
}

.crontab-root :deep(.cron-tab-form__number.el-input-number .el-input) {
  min-height: 28px;
  height: 28px;
}

.crontab-root :deep(.cron-tab-form__number.el-input-number .el-input__wrapper) {
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 8px;
  min-height: 28px;
  height: 28px;
}

.crontab-root :deep(.cron-tab-form__number .el-input-number__increase),
.crontab-root :deep(.cron-tab-form__number .el-input-number__decrease) {
  box-shadow: none !important;
  border-left: 1px solid var(--el-border-color) !important;
  border-right: 0 !important;
  top: 1px;
  bottom: 1px;
  background: #f5f7fa;
}

.crontab-root :deep(.cron-tab-form__number .el-input-number__decrease) {
  border-left: 0 !important;
  border-right: 1px solid var(--el-border-color) !important;
}

.crontab-root :deep(.cron-tab-form__number .el-input-number__increase:hover ~ .el-input .el-input__wrapper),
.crontab-root :deep(.cron-tab-form__number .el-input-number__decrease:hover ~ .el-input .el-input__wrapper) {
  box-shadow: none !important;
}

:deep(.el-tabs__header) {
  background-color: white;
  margin-top: -10px;
  padding: 0 30px;
  margin-bottom: 5px;

  .el-tabs__item {
    i.pre-icon {
      opacity: 0.6;
    }
  }

  .el-tabs__nav-next {
    right: 10px;
  }

  .el-tabs__nav-prev {
    left: 10px;
  }
}

.tab-page {
  :deep(.page-heading) {
    border-bottom: none;
  }

  :deep(.page-content) {
    overflow-y: hidden;
    padding: 0;
  }

  .tab-page-content {
    padding: 10px 30px 22px;
    overflow-y: auto;
    height: calc(100% - 50px);

    .el-alert {
      margin-top: 0;
      margin-bottom: 5px;
    }
  }
}

:deep(.el-tabs__nav-wrap) {
  position: static;
}
</style>
