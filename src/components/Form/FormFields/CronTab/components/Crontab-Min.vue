/* eslint-disable */
<template>
  <el-form class="cron-tab-form" size="small">
    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="1" size="small">
        <span class="cron-tab-form__text">
          {{ $t('Min') }}，{{ $t('WildcardsAllowed') }}[, - * /]
        </span>
      </el-radio>
    </el-form-item>
    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="3">
        <span class="cron-tab-form__text">{{ $t('From') }}</span>
        <span class="cron-tab-form__group">
          <el-input-number
            v-model="average02"
            :max="59"
            :min="1"
            size="small"
            class="cron-tab-form__number"
          />
          <span class="cron-tab-form__text">{{ $t('Min') }} {{ $t('ExecuteOnce') }}</span>
        </span>
      </el-radio>
    </el-form-item>

    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="4">
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
            <el-option v-for="item in 60" :key="item" :value="item - 1">{{ item - 1 }}</el-option>
          </el-select>
        </span>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'CrontabMin',
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
      radioValue: 1,
      cycle01: 1,
      cycle02: 2,
      average01: 0,
      average02: 1,
      checkboxList: [],
      checkNum: this.check
    }
  },
  computed: {
    cycleTotal: {
      get() {
        return this.cycle01 + '-' + (this.cycle02 ? this.cycle02 : '')
      },
      set() {
        this.cycle01 = this.checkNum(this.cycle01, 0, 59)
        this.cycle02 = this.checkNum(this.cycle02, 0, 59)
      }
    },
    averageTotal: {
      get() {
        return '*' + '/' + (this.average02 ? this.average02 : 0)
      },
      set() {
        this.average01 = this.checkNum(this.average01, 0, 59)
        this.average02 = this.checkNum(this.average02, 1, 59)
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
      if (this.radioValue !== 1 && this.cron.second === '*') {
        this.$emit('update', 'second', '0', 'min')
      }
      switch (this.radioValue) {
        case 1:
          this.$emit('update', 'min', '*', 'min')
          this.$emit('update', 'hour', '*', 'min')
          break
        case 2:
          this.$emit('update', 'min', this.cycle01 + '-' + this.cycle02, 'min')
          break
        case 3:
          this.$emit('update', 'min', '*' + '/' + this.average02, 'min')
          break
        case 4:
          this.$emit('update', 'min', this.checkboxString, 'min')
          break
      }
    },
    // 周期两个值变化时
    cycleChange() {
      if (this.radioValue === 2) {
        this.$emit('update', 'min', this.cycleTotal, 'min')
      }
    },
    // 平均两个值变化时
    averageChange() {
      if (this.radioValue === 3) {
        this.$emit('update', 'min', this.averageTotal, 'min')
      }
    },
    // checkbox值变化时
    checkboxChange() {
      if (this.radioValue === 4) {
        this.$emit('update', 'min', this.checkboxString, 'min')
      }
    }
  }
}
</script>

<style scoped></style>
