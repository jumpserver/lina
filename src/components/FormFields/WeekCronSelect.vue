<template>
  <div>
    <div class="hours-container">
      <div v-for="(item, index) in hours" :key="index" class="hours-item">
        <div
          :class="compClass(item)"
          @click="handleClick(item)"
          @mouseover="handleHover( item)"
        />
      </div>
    </div>
    <div class="tips">{{ tips }}</div>
  </div>
</template>
<script>
export default {
  model: {
    prop: 'sendTimeList'
  },
  props: {
    sendTimeList: {
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // 选项
      weeks: ['星期一', '星期二', '星期三', '星期四', '星期五'],
      selectStart: false, // 开始
      startIndex: '', // 开始下标
      timeRangeList: [], // 选择的时间段
      timeRangeListIndex: [], // 选中的下标
      tempRangeIndex: [], // 预选下标
      tips: '向右选中，向左取消选择'
    }
  },
  computed: {
  },
  watch: {
    timeRangeList: function(value) {
      this.$emit('change', value)
      this.$parent.$emit('el.form.change')// 触发父组件的校验规则
    },
    sendTimeList: {
      handler() {
        this.transformedIndex()
      },
      deep: true
    }
  },
  mounted() {
    this.transformedIndex()
  },
  methods: {
    // 时间区间转换成下标区间
    transformedIndex() {
      this.timeRangeListIndex = []
      this.timeRangeList = this.sendTimeList
      this.timeRangeList.forEach(element => {
        const [startTime, endTime] = element.match(/\d+\:\d+/g)
        if (startTime && endTime) {
          const [startHour, startMin] = startTime.split(':')
          const [endHour, endMin] = endTime.split(':')
          if (startHour && startMin && endHour && endMin) {
            let startNum, endNum
            if (startMin === '00') {
              startNum = 2 * parseInt(startHour)
            } else {
              startNum = 2 * parseInt(startHour) + 1
            }
            if (endMin === '00') {
              endNum = 2 * parseInt(endHour) - 1
            } else {
              endNum = 2 * parseInt(endHour)
            }
            while (endNum >= startNum) {
              this.timeRangeListIndex.push(startNum)
              startNum++
            }
          } else {
            this.$message.error('时间段格式不正确')
          }
        } else {
          this.$message.error('没有拿到开始时间或结束时间或者时间段格式不对')
        }
      })
      this.tips = this.timeRangeList && this.timeRangeList.length > 0 ? this.timeRangeList : '向右选中，向左取消选择'
    },
    // 下标区间转换成时间区间
    transformedSection() {
      this.timeRangeList = []
      let startTime = ''
      let endTime = ''
      const len = this.hours.length
      console.log('timeRangeListIndex: ', this.timeRangeListIndex)
      for (let index = this.hours[0] * 2; index < 2 * (len + 1); index++) {
        if (this.timeRangeListIndex.indexOf(index) > -1) {
          if (startTime) { // 如果有开始时间，直接确定结束时间
            const endHour = Math.floor((index + 1) / 2)
            const endMin = '00'
            endTime = `${endHour < 10 ? '0' + endHour : endHour}:${endMin}`
          } else { // 没有开始时间，确定当前点为开始时间
            const startHour = Math.floor(index / 2)
            const startMin = '00'
            startTime = `${startHour < 10 ? '0' + startHour : startHour}:${startMin}`
          }
          if (index === 2 * this.hours.length + 1) { // 如果是最后一格，直接结束
            endTime = `${Math.floor((index + 1) / 2)}:00`
            this.timeRangeList.push(`${startTime || '23:30'}-${endTime}`)
            startTime = ''
            endTime = ''
          }
        } else { // 若这个点不在选择区间，确定一个时间段
          if (startTime && endTime) {
            this.timeRangeList.push(`${startTime}-${endTime}`)
            startTime = ''
            endTime = ''
          } else if (startTime && !endTime) { // 这里可能只选半个小时
            const endHour = Math.floor(index / 2)
            const endMin = '30'
            endTime = `${endHour < 10 ? '0' + endHour : endHour}:${endMin}`
            this.timeRangeList.push(`${startTime}-${endTime}`)
            startTime = ''
            endTime = ''
          }
        }
      }
      this.tips = this.timeRangeList && this.timeRangeList.length > 0 ? this.timeRangeList : '向右选中，向左取消选择'
    },
    // 点击事件
    handleClick(index) {
      if (this.selectStart) {
        if (index === this.startIndex) { // 双击取反
          if (this.timeRangeListIndex.indexOf(index) > -1) {
            this.timeRangeListIndex.splice(this.timeRangeListIndex.indexOf(index), 1)
          } else {
            this.timeRangeListIndex.push(this.startIndex)
          }
        } else if (index > this.startIndex) { // 选取数据--向右添加，向左取消
          while (index >= this.startIndex) {
            this.timeRangeListIndex.push(this.startIndex)
            this.startIndex++
          }
          this.timeRangeListIndex = Array.from(new Set(this.timeRangeListIndex))
        } else { // 删除数据
          while (this.startIndex >= index) {
            if (this.timeRangeListIndex.indexOf(index) > -1) {
              this.timeRangeListIndex.splice(this.timeRangeListIndex.indexOf(index), 1)
            }
            index++
          }
        }
        this.startIndex = ''
        this.tempRangeIndex = []
        this.transformedSection()
      } else {
        this.startIndex = index
      }
      this.selectStart = !this.selectStart
    },
    // 预选区间
    handleHover(index) {
      if (this.selectStart) {
        this.tempRangeIndex = []
        if (index > this.startIndex) { // 选取数据--向右添加，向左取消
          while (index >= this.startIndex) {
            this.tempRangeIndex.push(index)
            index--
          }
        } else { // 删除数据
          while (this.startIndex >= index) {
            this.tempRangeIndex.push(index)
            index++
          }
        }
      }
    },
    // 是否选中，计算className
    compClass(index) {
      if (index === this.startIndex) {
        return 'hours-item preSelected'
      }
      if (index >= this.startIndex) {
        if (this.tempRangeIndex.indexOf(index) > -1) {
          return 'hours-item preSelected'
        }
      } else {
        if (this.tempRangeIndex.indexOf(index) > -1) {
          return 'hours-item unSelected'
        }
      }
      return this.timeRangeListIndex.indexOf(index) > -1 ? 'hours-item selected' : 'hours-item'
    },
    compItem(item) { // 不足10前面补0
      return item < 10 ? `0${item}` : item
    }

  }
}
</script>

<style lang='scss' scoped>
.hours-container {
  display: flex;
  cursor: pointer;
  .hours-item {
    width: 15px;
    height: 30px;
    border: 1px solid #c2d0f3;
    border-right: none;
    text-align: center;
    &:last-child {
      border-right: 1px solid #c2d0f3;
    }
    .hours-item-header {
      width: 100%;
      height: 30px;
      line-height: 30px;
      border-bottom: 1px solid #c2d0f3;
    }
    .hours-item-value {
      width: 100%;
      height: 30px;
      box-sizing: border-box;
      display: flex;
    }
    .selected {
      background-color: #4e84fe;
      border-bottom: 1px solid #c2d0f3;
    }
    .preSelected {
      background-color: #8eaffc;
      border-bottom: 1px solid #c2d0f3;
    }
    .unSelected {
      background-color: #ffffff;
      border-bottom: 1px solid #c2d0f3;
    }
  }
}
.tips {
  width: 100%;
  line-height: 30px;
}
</style>
