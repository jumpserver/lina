/* eslint-disable */
<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">
        {{ this.$t('common.CronTab.week') }}，{{ this.$t('common.CronTab.wildcardsAllowed') }}[, - * /]
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        {{ this.$t('common.CronTab.cycleFromWeek') }}
        <el-input-number v-model="cycle01" :max="7" :min="1" size="mini" /> -
        <el-input-number v-model="cycle02" :max="7" :min="1" size="mini" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6">
        {{ this.$t('common.CronTab.appoint') }}
        <el-select
          v-model="checkboxList"
          :placeholder="$tc('common.CronTab.manyChoose')"
          clearable
          multiple
          style="width:100%"
        >
          <el-option v-for="(item,index) of weekList" :key="index" :value="index === 6 ? 0 : (index + 1)">
            {{ item }}
          </el-option>
        </el-select>
      </el-radio>
    </el-form-item>

  </el-form>
</template>

<script>
export default {
  name: 'CrontabWeek',
  props: {
    cron: {
      type: Object,
      default: () => {
        return {}
      }
    },
    check: {
      type: Function,
      default: () => {
      }
    }
  },
  data() {
    return {
      radioValue: 2,
      weekday: 1,
      cycle01: 1,
      cycle02: 2,
      average01: 1,
      average02: 1,
      checkboxList: [],
      weekList: [this.$t('common.CronTab.Monday'), this.$t('common.CronTab.Tuesday'), this.$t('common.CronTab.Wednesday'), this.$t('common.CronTab.Thursday'), this.$t('common.CronTab.Friday'), this.$t('common.CronTab.Saturday'), this.$t('common.CronTab.Sunday')],
      checkNum: this.$options.propsData.check
    }
  },
  computed: {
    cycleTotal: {
      get() {
        return this.cycle01 + '-' + this.cycle02
      },
      set() {
        this.cycle01 = this.checkNum(this.cycle01, 1, 7)
        this.cycle02 = this.checkNum(this.cycle02, 1, 7)
      }
    },
    averageTotal: {
      get() {
        return this.average01 + '#' + this.average02
      },
      set() {
        this.average01 = this.checkNum(this.average01, 1, 4)
        this.average02 = this.checkNum(this.average02, 1, 7)
      }
    },
    checkboxString: {
      get() {
        const str = this.checkboxList.join()
        return str === '' ? '*' : str
      },
      set() {
      }
    }
  },
  watch: {
    'radioValue': 'radioChange',
    'cycleTotal': 'cycleChange',
    'averageTotal': 'averageChange',
    'weekdayCheck': 'weekdayChange',
    'checkboxString': 'checkboxChange'
  },
  created() {
    this.$nextTick(() => {
      const arrs = []
      for (let index = 0; index < this.checkboxList.length; index++) {
        const cur = this.checkboxList[index]
        arrs.push(parseFloat(cur))
      }
      this.checkboxList = arrs
    })
  },
  methods: {
    // 单选按钮值变化时
    radioChange() {
      if (this.radioValue === 1) {
        this.$emit('update', 'week', '*')
        this.$emit('update', 'year', '*')
      } else {
        if (this.cron.month === '*') {
          this.$emit('update', 'month', '*', 'week')
        }
        if (this.cron.day === '*') {
          this.$emit('update', 'day', '*', 'week')
        }
        if (this.cron.hour === '*') {
          this.$emit('update', 'hour', '*', 'week')
        }
        if (this.cron.min === '*') {
          this.$emit('update', 'min', '*', 'week')
        }
        if (this.cron.second === '*') {
          this.$emit('update', 'second', '*', 'week')
        }
      }
      switch (this.radioValue) {
        case 2:
          this.$emit('update', 'week', '?')
          break
        case 3:
          this.$emit('update', 'week', this.cycle01 + '-' + this.cycle02)
          break
        case 4:
          this.$emit('update', 'week', this.average01 + '#' + this.average02)
          break
        case 5:
          this.$emit('update', 'week', this.weekday + 'L')
          break
        case 6:
          this.$emit('update', 'week', this.checkboxString)
          break
      }
    },
    // 根据互斥事件，更改radio的值

    // 周期两个值变化时
    cycleChange() {
      if (this.radioValue === 3) {
        this.$emit('update', 'week', this.cycleTotal)
      }
    },
    // 平均两个值变化时
    averageChange() {
      if (this.radioValue === 4) {
        this.$emit('update', 'week', this.averageTotal)
      }
    },
    // 最近工作日值变化时
    weekdayChange() {
      if (this.radioValue === 5) {
        this.$emit('update', 'week', this.weekday + 'L')
      }
    },
    // checkbox值变化时
    checkboxChange() {
      if (this.radioValue === 6) {
        this.$emit('update', 'week', this.checkboxString)
      }
    }
  }
}
</script>

<style scoped>
	.el-form-item--small.el-form-item {
    margin-bottom: 10px;
  }
</style>
