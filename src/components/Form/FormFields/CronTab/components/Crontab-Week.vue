/* eslint-disable */
<template>
  <el-form class="cron-tab-form" size="small">
    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="1">
        <span class="cron-tab-form__text">
          {{ $t('Week') }}，{{ $t('WildcardsAllowed') }}[, - * /]
        </span>
      </el-radio>
    </el-form-item>

    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="3">
        <span class="cron-tab-form__text">{{ $t('CycleFromWeek') }}</span>
        <span class="cron-tab-form__group">
          <el-input-number
            v-model="cycle01"
            :max="7"
            :min="1"
            size="small"
            class="cron-tab-form__number"
          />
          <span class="cron-tab-form__separator">-</span>
          <el-input-number
            v-model="cycle02"
            :max="7"
            :min="1"
            size="small"
            class="cron-tab-form__number"
          />
        </span>
      </el-radio>
    </el-form-item>

    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="6">
        <span class="cron-tab-form__text">{{ $t('Appoint') }}</span>
        <span class="cron-tab-form__group">
          <el-select
            v-model="checkboxList"
            :placeholder="$tc('ManyChoose')"
            clearable
            multiple
            size="small"
            class="cron-tab-form__select"
          >
            <el-option
              v-for="(item, index) of weekList"
              :key="index"
              :value="index === 6 ? 0 : index + 1"
            >
              {{ item }}
            </el-option>
          </el-select>
        </span>
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
      default: () => {}
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
      weekList: [
        this.$t('Monday'),
        this.$t('Tuesday'),
        this.$t('Wednesday'),
        this.$t('Thursday'),
        this.$t('Friday'),
        this.$t('Saturday'),
        this.$t('Sunday')
      ],
      checkNum: this.check
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
      set() {}
    }
  },
  watch: {
    radioValue: 'radioChange',
    cycleTotal: 'cycleChange',
    averageTotal: 'averageChange',
    weekdayCheck: 'weekdayChange',
    checkboxString: 'checkboxChange'
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

<style scoped></style>
