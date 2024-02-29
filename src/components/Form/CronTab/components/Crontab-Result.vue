/* eslint-disable */
<template>
  <div class="popup-result">
    <p class="title">{{ this.$t('common.CronTab.runningTimes') }}</p>
    <ul class="popup-result-scroll">
      <template v-if="isShow">
        <li v-for="item in resultList" :key="item">{{ item }}</li>
      </template>
      <li v-else>{{ this.$t('common.CronTab.calculationResults') }}</li>
    </ul>
  </div>
</template>

<script>
import parser from 'cron-parser'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'CrontabResult',
  props: {
    ex: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      dayRule: '',
      dayRuleSup: '',
      dateArr: [],
      resultList: [],
      isShow: false
    }
  },
  watch: {
    'ex': 'expressionChange222'
  },
  mounted: function() {
    // 初始化 获取一次结果
    this.expressionChange222()
  },
  methods: {
    expressionChange222() {
      this.isShow = true
      const rule = 0 + ' ' + this.$options.propsData.ex
      try {
        this.resultList = []
        const interval = parser.parseExpression(rule)
        for (let index = 0; index < 5; index++) {
          const cur = interval.next().toString()
          this.resultList.push(toSafeLocalDateStr(cur))
        }
        const first = new Date(this.resultList[0])
        const second = new Date(this.resultList[1])
        const diff = Math.abs(second - first)
        this.$emit('crontabDiffChange', diff)
      } catch (error) {
        this.isShow = false
        // debug(error, 'error')
      }
    }
  }
}

</script>
