<template>
  <div class="c-weektime">
    <div class="c-schedue" />
    <div :class="{'c-schedue': true, 'c-schedue-notransi': mode}" :style="styleValue" />
    <table :class="{'c-min-table': colspan < 2}" class="c-weektime-table">
      <thead class="c-weektime-head">
        <tr>
          <th class="week-td" rowspan="8">{{ this.$t('common.WeekCronSelect.WeekOrTime') }}</th>
          <th :colspan="12 * colspan">00:00 - 12:00</th>
          <th :colspan="12 * colspan">12:00 - 24:00</th>
        </tr>
        <tr>
          <td v-for="t in theadArr" :key="t" :colspan="colspan">{{ t }}</td>
        </tr>
      </thead>
      <tbody class="c-weektime-body" @mouseleave="containerLeave()">
        <tr v-for="t in weektimeData" :key="t.row">
          <td>{{ t.value }}</td>
          <td
            v-for="n in t.child"
            :key="`${n.row}-${n.col}`"
            :class="selectClasses(n)"
            :data-time="n.col"
            :data-week="n.row"
            class="weektime-atom-item"
            @mousedown="cellDown(n)"
            @mouseenter="cellEnter(n)"
            @mouseup="cellUp(n)"
          />
        </tr>
        <tr>
          <td class="c-weektime-preview" colspan="49">
            <div class="g-clearfix c-weektime-con">
              <span class="g-pull-left">{{ this.$t('common.WeekCronSelect.CanDragSelect') }}</span>
              <a class="g-pull-right" @click.prevent="clearWeektime">{{ this.$t('common.WeekCronSelect.ClearSelection') }}</a>
              <a class="g-pull-right g-pull-margin" @click.prevent="selectAll">{{ this.$t('common.WeekCronSelect.SelectAll') }}</a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
const createArr = len => {
  return Array.from(Array(len)).map((ret, id) => id)
}
function splicing(list) {
  let same
  let i = -1
  const len = list.length
  const arr = []

  if (!len) return
  while (++i < len) {
    const item = list[i]
    if (item.check) {
      if (item.check !== Boolean(same)) {
        arr.push(...['、', item.begin, '~', item.end])
      } else if (arr.length) {
        arr.pop()
        arr.push(item.end)
      }
    }
    same = Boolean(item.check)
  }
  arr.shift()
  return arr.join('')
}
export default {
  name: 'WeekCronSelect',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    colspan: {
      type: Number,
      default() {
        return 2
      }
    }
  },
  data() {
    return {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      mode: 0,
      row: 0,
      col: 0,
      theadArr: [],
      weekArr: [
        this.$t('common.WeekCronSelect.Monday'),
        this.$t('common.WeekCronSelect.Tuesday'),
        this.$t('common.WeekCronSelect.Wednesday'),
        this.$t('common.WeekCronSelect.Thursday'),
        this.$t('common.WeekCronSelect.Friday'),
        this.$t('common.WeekCronSelect.Saturday'),
        this.$t('common.WeekCronSelect.Sunday')
      ],
      weektimeData: [],
      timeRange: [] // 格式化之后数据
    }
  },
  computed: {
    styleValue() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: `${this.left}px`,
        top: `${this.top}px`
      }
    },
    selectClasses() {
      return n => n.check ? 'ui-selected' : ''
    }
  },
  created() {
    this.init()
    if (this.value.length > 0) this.nextValue()
  },
  methods: {
    // 初始化数据结构
    init() {
      this.theadArr = createArr(24)
      const isData = this.weekArr.map((ret, index) => {
        const children = (ret, row, max) => {
          return createArr(max).map((t, col) => {
            const curValue = this.formatWeektime(col)
            return {
              week: ret,
              value: curValue,
              begin: curValue.split('~')[0],
              end: curValue.split('~')[1],
              row: row,
              col: col
            }
          })
        }
        return {
          value: ret,
          row: index,
          child: children(ret, index, 48)
        }
      })
      this.weektimeData = isData
    },
    // 反解析传递过来的默认值
    nextValue() {
      const deepValue = _.cloneDeep(this.value)
      for (let i = 0, len = deepValue.length; i < len; i++) {
        const cur = deepValue[i]
        const curValue = cur?.value
        if (curValue.length > 0) {
          const childValue = curValue.split('、')
          for (let j = 0; j < childValue.length; j++) {
            const curJ = childValue[j]
            this.renderWeekRange(curJ, cur.id)
          }
        }
      }
    },
    // 渲染时间区间
    renderWeekRange(val, id) {
      const idNum = id === 0 ? 6 : id - 1
      const [start, end] = val.split('~')
      const startVal = this.countIndex(start)
      const endVal = this.countIndex(end)
      for (let i = startVal; i < (endVal === 0 ? 48 : endVal); i++) {
        const curWeek = this.weektimeData[idNum]
        curWeek.child[i].check = true
      }
    },
    // 计算索引
    countIndex(val) {
      const one = val.substr(0, 2)
      const a1 = one.startsWith('0') ? one.substr(1, 2) : one
      var reg = RegExp(/30/)
      const a2 = val.match(reg) ? 1 : 0
      const curIndex = (a1 * 2) + a2
      return curIndex
    },
    formatDate(date, fmt) {
      const o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds()
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
      }
      return fmt
    },
    formatWeektime(col) {
      const timeStamp = 1542384000000 // '2018-11-17 00:00:00'
      const timezone = 8
      const offsetGMT = new Date().getTimezoneOffset() // 本地时间和格林威治的时间差，单位为分钟
      const nowDate = new Date(timeStamp).getTime()
      const targetStamp = new Date(nowDate + offsetGMT * 60 * 1000 + timezone * 60 * 60 * 1000).getTime()

      const beginStamp = targetStamp + col * 1800000 // col * 30 * 60 * 1000
      const endStamp = beginStamp + 1800000

      const begin = this.formatDate(new Date(beginStamp), 'hh:mm')
      const end = this.formatDate(new Date(endStamp), 'hh:mm')
      return `${begin}~${end}`
    },
    // 清空时间段
    clearWeektime() {
      this.weektimeData.forEach(item => {
        item.child.forEach(t => {
          this.$set(t, 'check', false)
        })
      })
      this.timeRange = []
      this.$emit('change', this.timeRange)
    },
    // 全选
    selectAll() {
      this.weektimeData.forEach(item => {
        item.child.forEach(t => {
          this.$set(t, 'check', true)
        })
      })
      this.setTimeRange()
    },
    containerLeave() {
      this.width = 0
      this.height = 0
      this.mode = 0
    },
    setTimeRange() {
      this.timeRange = this.weektimeData.map(item => {
        return {
          id: item.row === 6 ? 0 : item.row + 1,
          value: splicing(item.child)
        }
      })
      this.$emit('change', this.timeRange)
    },
    cellEnter(item) {
      const ele = document.querySelector(`td[data-week='${item.row}'][data-time='${item.col}']`)
      if (ele && !this.mode) {
        this.left = ele.offsetLeft
        this.top = ele.offsetTop
      } else {
        if (item.col <= this.col && item.row <= this.row) {
          this.width = (this.col - item.col + 1) * ele.offsetWidth
          this.height = (this.row - item.row + 1) * ele.offsetHeight
          this.left = ele.offsetLeft
          this.top = ele.offsetTop
        } else if (item.col >= this.col && item.row >= this.row) {
          this.width = (item.col - this.col + 1) * ele.offsetWidth
          this.height = (item.row - this.row + 1) * ele.offsetHeight
          if (item.col > this.col && item.row === this.row) this.top = ele.offsetTop
          if (item.col === this.col && item.row > this.row) this.left = ele.offsetLeft
        } else if (item.col > this.col && item.row < this.row) {
          this.width = (item.col - this.col + 1) * ele.offsetWidth
          this.height = (this.row - item.row + 1) * ele.offsetHeight
          this.top = ele.offsetTop
        } else if (item.col < this.col && item.row > this.row) {
          this.width = (this.col - item.col + 1) * ele.offsetWidth
          this.height = (item.row - this.row + 1) * ele.offsetHeight
          this.left = ele.offsetLeft
        }
      }
    },
    cellDown(item) {
      const ele = document.querySelector(`td[data-week='${item.row}'][data-time='${item.col}']`)
      this.check = Boolean(item.check)
      this.mode = 1
      if (ele) {
        this.width = ele.offsetWidth
        this.height = ele.offsetHeight
      }

      this.row = item.row
      this.col = item.col
    },
    cellUp(item) {
      if (item.col <= this.col && item.row <= this.row) {
        this.selectWeek([item.row, this.row], [item.col, this.col], !this.check)
      } else if (item.col >= this.col && item.row >= this.row) {
        this.selectWeek([this.row, item.row], [this.col, item.col], !this.check)
      } else if (item.col > this.col && item.row < this.row) {
        this.selectWeek([item.row, this.row], [this.col, item.col], !this.check)
      } else if (item.col < this.col && item.row > this.row) {
        this.selectWeek([this.row, item.row], [item.col, this.col], !this.check)
      }

      this.width = 0
      this.height = 0
      this.mode = 0

      this.setTimeRange()
    },
    selectWeek(row, col, check) {
      const [minRow, maxRow] = row
      const [minCol, maxCol] = col
      this.weektimeData.forEach(item => {
        item.child.forEach(t => {
          if (t.row >= minRow && t.row <= maxRow && t.col >= minCol && t.col <= maxCol) {
            this.$set(t, 'check', check)
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.c-weektime {
  min-width: 640px;
  position: relative;
  display: inline-block;
  padding-right: 20px;
}
.c-schedue {
  background: #598fe6;
  position: absolute;
  width: 0;
  height: 0;
  opacity: .6;
  pointer-events: none;
}
.c-schedue-notransi {
  transition: width .12s ease, height .12s ease, top .12s ease, left .12s ease;
}
.c-weektime-table {
  border-collapse: collapse;
  th {
    vertical-align: inherit;
    font-weight: bold;
  }
  tr {
    height: 30px;
  }
  tr, td, th {
    user-select: none;
    border: 1px solid #dee4f5;
    text-align: center;
    min-width: 12px;
    line-height: 1.6em;
    transition: background .16s ease;
  }
  .c-weektime-head {
    font-size: 12px;
    .week-td {
      width: 72px;
    }
  }
  .c-weektime-body {
    font-size: 12px;
    td {
      &.weektime-atom-item {
        user-select: unset;
        background-color: #f5f5f5;
      }
      &.ui-selected {
        background-color: #598fe6;
      }
    }
  }
  .c-weektime-preview {
    line-height: 2.4em;
    padding: 0 10px;
    font-size: 13px;
    .c-weektime-con {
      line-height: 42px;
      user-select: none;
    }
    .c-weektime-time {
      text-align: left;
      line-height: 2.4em;
      p {
        max-width: 625px;
        line-height: 1.4em;
        word-break: break-all;
        margin-bottom: 8px;
      }
    }
  }
}
.c-min-table {
  tr, td, th {
    min-width: 24px;
  }
}
.g-clearfix {
  &:after, &:before {
    clear: both;
    content: " ";
    display: table;
  }
}
.g-pull-left {
  float: left;
}
.g-pull-right {
  float: right;
  color: #409eff!important;
}
.g-pull-margin {
  margin-right: 12px;
}
.g-tip-text {
  color: #999;
}
</style>
