/* eslint-disable */
<template>
  <el-form class="cron-tab-form" size="small">
    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="1">
        <span class="cron-tab-form__text">
          {{ $t('Hour') }}，{{ $t('WildcardsAllowed') }}[, - * /]
        </span>
      </el-radio>
    </el-form-item>

    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="2">
        <span class="cron-tab-form__text">{{ $t('From') }}</span>
        <span class="cron-tab-form__group">
          <el-input-number
            v-model="cycle01"
            :max="23"
            :min="0"
            size="small"
            class="cron-tab-form__number"
          />
          <span class="cron-tab-form__separator">-</span>
          <el-input-number
            v-model="cycle02"
            :max="23"
            :min="0"
            size="small"
            class="cron-tab-form__number"
          />
          <span class="cron-tab-form__text">{{ $t('Hour') }}</span>
        </span>
      </el-radio>
    </el-form-item>

    <el-form-item class="cron-tab-form__item">
      <el-radio v-model="radioValue" :value="3">
        <span class="cron-tab-form__text">{{ $t('Every') }}</span>
        <span class="cron-tab-form__group">
          <el-input-number
            v-model="average02"
            :max="23"
            :min="1"
            size="small"
            class="cron-tab-form__number"
          />
          <span class="cron-tab-form__text">{{ $t('Hour') }} {{ $t('ExecuteOnce') }}</span>
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
            <el-option v-for="item in 24" :key="item" :value="item - 1">{{ item - 1 }}</el-option>
          </el-select>
        </span>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'CrontabHour',
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
      cycle01: 0,
      cycle02: 1,
      average01: 0,
      average02: 1,
      checkboxList: [],
      checkNum: this.check
    }
  },
  computed: {
    cycleTotal: {
      get() {
        return this.cycle01 + '-' + this.cycle02
      },
      set() {
        this.cycle01 = this.checkNum(this.cycle01, 0, 23)
        this.cycle02 = this.checkNum(this.cycle02, 0, 23)
      }
    },
    averageTotal: {
      get() {
        return '*' + '/' + this.average02
      },
      set() {
        this.average01 = this.checkNum(this.average01, 0, 23)
        this.average02 = this.checkNum(this.average02, 1, 23)
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
      if (this.radioValue === 1) {
        this.$emit('update', 'hour', '*', 'hour')
        // this.$emit('update', 'day', '*', 'hour')
      } else {
        if (this.cron.min === '*') {
          this.$emit('update', 'min', '0', 'hour')
        }
        if (this.cron.second === '*') {
          this.$emit('update', 'second', '0', 'hour')
        }
      }
      switch (this.radioValue) {
        case 2:
          this.$emit('update', 'hour', this.cycle01 + '-' + this.cycle02)
          break
        case 3:
          this.$emit('update', 'hour', '*' + '/' + this.average02)
          break
        case 4:
          this.$emit('update', 'hour', this.checkboxString)
          break
      }
    },
    // 周期两个值变化时
    cycleChange() {
      if (this.radioValue === 2) {
        this.$emit('update', 'hour', this.cycleTotal)
      }
    },
    // 平均两个值变化时
    averageChange() {
      if (this.radioValue === 3) {
        this.$emit('update', 'hour', this.averageTotal)
      }
    },
    // checkbox值变化时
    checkboxChange() {
      if (this.radioValue === 4) {
        this.$emit('update', 'hour', this.checkboxString)
      }
    }
  }
}
</script>

<style scoped></style>
