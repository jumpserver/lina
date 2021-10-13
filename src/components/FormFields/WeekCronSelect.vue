<template>
  <div class="c-weektime">
    <div class="c-schedue" />
    <div :class="{'c-schedue': true, 'c-schedue-notransi': mode}" :style="styleValue" />

    <table class="c-weektime-table" :class="{'c-min-table': colspan < 2}">
      <thead class="c-weektime-head">
        <tr>
          <th rowspan="8" class="week-td">{{ this.$t('common.WeekCronSelect.WeekOrTime') }}</th>
          <th :colspan="12 * colspan">00:00 - 12:00</th>
          <th :colspan="12 * colspan">12:00 - 24:00</th>
        </tr>
        <tr>
          <td v-for="t in theadArr" :key="t" :colspan="colspan">{{ t }}</td>
        </tr>
      </thead>
      <tbody class="c-weektime-body">
        <tr v-for="t in weektimeData" :key="t.row">
          <td>{{ t.value }}</td>
          <td
            v-for="n in t.child"
            :key="`${n.row}-${n.col}`"
            :data-week="n.row"
            :data-time="n.col"
            :class="selectClasses(n)"
            class="weektime-atom-item"
            @mouseenter="cellEnter(n)"
            @mousedown="cellDown(n)"
            @mouseup="cellUp(n)"
          />
        </tr>
        <tr>
          <td colspan="49" class="c-weektime-preview">
            <div class="g-clearfix c-weektime-con">
              <span class="g-pull-left">{{ selectState ? '已选择时间段' : this.$t('common.WeekCronSelect.CanDragSelect') }}</span>
              <a class="g-pull-right" @click.prevent="clearWeektime">{{ this.$t('common.WeekCronSelect.ClearSelection') }}</a>
            </div>
            <div v-if="selectState" class="c-weektime-time">
              <div v-for="t in selectValue" :key="t.id">
                <p v-if="t.value">
                  <span class="g-tip-text">{{ t.week }}：</span>
                  <span>{{ t.value }}</span>
                </p>
              </div>
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
export default {
  name: 'WeekCronSelect',
  props: {
    value: {
      type: Array,
      default: () => [
        { id: 0, week: 'Monday', value: '' },
        { id: 1, week: 'Tuesday', value: '' },
        { id: 2, week: 'Wednesday', value: '' },
        { id: 3, week: 'Thursday', value: '' },
        { id: 4, week: 'Friday', value: '' },
        { id: 5, week: 'Saturday', value: '' },
        { id: 6, week: 'Sunday', value: '' }
      ]
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
      weektimeData: []
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
    selectValue() {
      return this.value
    },
    selectState() {
      return this.value.some(ret => ret.value)
    },
    selectClasses() {
      return n => n.check ? 'ui-selected' : ''
    }
  },
  created() {
    this.theadArr = createArr(24)
    const isData = this.weekArr.map((ret, index) => {
      const children = (ret, row, max) => {
        return this.handleCreateArr(max).map((t, col) => {
          return {
            week: ret,
            value: this.formatWeektime(col),
            begin: this.formatWeektime(col).split('~')[0],
            end: this.formatWeektime(col).split('~')[1],
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
  methods: {
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
    handleCreateArr(len) {
      return Array.from(Array(len)).map((ret, id) => id)
    },
    formatWeektime(col) {
      const timeStamp = 1542384000000 // '2018-11-17 00:00:00'
      const beginStamp = timeStamp + col * 1800000 // col * 30 * 60 * 1000
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
.g-tip-text {
  color: #999;
}
</style>
