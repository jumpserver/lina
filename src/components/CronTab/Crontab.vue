/* eslint-disable */
<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane v-if="shouldHide('min')" :label="this.$t('common.CronTab.min')">
        <CrontabMin
          ref="cronmin"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('hour')" :label="this.$t('common.CronTab.hour')">
        <CrontabHour
          ref="cronhour"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('day')" :label="this.$t('common.CronTab.day')">
        <CrontabDay
          ref="cronday"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('month')" :label="this.$t('common.CronTab.month')">
        <CrontabMonth
          ref="cronmonth"
          :check="checkNumber"
          :cron="contabValueObj"
          @update="updateContabValue"
        />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('week')" :label="this.$t('common.CronTab.week')">
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
        <p class="title">{{ this.$t('common.CronTab.timeExpression') }}</p>
        <table>
          <thead>
            <th v-for="item of tabTitles" :key="item" width="40">{{ item }}</th>
          </thead>
          <tbody>
            <td>
              <el-input
                v-model.trim="contabValueObj.min"
                min="0"
                max="5"
                size="small"
                onkeyup="value=value.replace(/[^\0-9\-\*\,]/g,'')"
              />
            </td>
            <td>
              <el-input
                v-model.trim="contabValueObj.hour"
                size="small"
                onkeyup="value=value.replace(/[^\0-9\-\*\,]/g,'')"
              />
            </td>
            <td>
              <el-input
                v-model.trim="contabValueObj.day"
                size="small"
                onkeyup="value=value.replace(/[^\0-9\\-\*\,]/g,'')"
              />
            </td>
            <td>
              <el-input
                v-model.trim="contabValueObj.month"
                size="small"
                onkeyup="value=value.replace(/[^\0-9\-\*\,]/g,'')"
              />
            </td>
            <td>
              <el-input
                v-model.trim="contabValueObj.week"
                size="small"
                onkeyup="value=value.replace(/[^\0-9\-\*\,]/g,'')"
              />
            </td>
          </tbody>
        </table>
        <div style="margin: 0 auto; text-align: center">
          <div style="font-size: 13px;">{{ this.$t('common.CronTab.cronExpression') }}</div>
          <div style="font-size: 13px;">{{ contabValueString }}</div>
        </div>
      </div>
      <CrontabResult :ex="contabValueString" />

      <div class="pop_btn">
        <el-button
          size="small"
          @click="clearCron"
        >
          {{ this.$t('common.Reset') }}
        </el-button>
        <el-button
          size="small"
          type="primary"
          @click="submitFill"
        >
          {{ this.$t('common.Confirm') }}
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
  name: 'Vcrontab',
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
      tabTitles: [this.$t('common.CronTab.min'), this.$t('common.CronTab.hour'), this.$t('common.CronTab.day'), this.$t('common.CronTab.month'), this.$t('common.CronTab.week')],
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
      newContabValueString: ''
    }
  },
  computed: {
    contabValueString: {
      get() {
        const obj = this.contabValueObj
        const str =
          obj.min +
          ' ' +
          obj.hour +
          ' ' +
          obj.day +
          ' ' +
          obj.month +
          ' ' +
          obj.week
        return str
      },
      set() {
      }
    }
  },
  watch: {
    expression: 'resolveExp',
    hideComponent(value) {
      // 隐藏部分组件
    }
  },
  mounted: function() {
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
    }
  }
}
</script>
<style scoped>
.pop_btn {
  text-align: center;
  margin-top: 20px;
}
.popup-main {
  position: relative;
  margin: 10px auto 0;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
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
  margin: 17px auto;
  padding: 10px 10px 10px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);
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
.popup-result table {
  text-align: center;
  width: 100%;
  margin: 0 auto;
}
.popup-result table span {
  display: block;
  width: 100%;
  font-family: arial;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.popup-result-scroll {
  font-size: 12px;
  line-height: 24px;
  height: 10em;
  overflow-y: auto;
}
.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 10px;
}
</style>
