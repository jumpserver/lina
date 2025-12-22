/* eslint-disable */
<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">
        {{ $t('Week') }}，{{ $t('WildcardsAllowed') }}[, - * /]
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        {{ $t('CycleFromWeek') }}
        <el-input-number v-model="cycle01" :max="7" :min="1" size="mini" /> -
        <el-input-number v-model="cycle02" :max="7" :min="1" size="mini" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6">
        {{ $t('Appoint') }}
        <el-select
          v-model="checkboxList"
          :placeholder="$tc('ManyChoose')"
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
      weekList: [this.$t('Monday'), this.$t('Tuesday'), this.$t('Wednesday'), this.$t('Thursday'), this.$t('Friday'), this.$t('Saturday'), this.$t('Sunday')],
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

</style>
