<template>
  <div id="selectContainer" class="grad-table" @mousedown="handleMouseDown">
    <div v-if="loading" class="loading-box">
      <span class="el-icon-loading" />
    </div>
    <table v-else bordercolor="#c2d0f3" cellpadding="0" cellspacing="0" class="gridtable" align="center">
      <tr v-for="(item, index) in tableData" :key="index">
        <td class="week-first-td">
          {{ weekEnum[index] }}
        </td>
        <td
          v-for="(temp, key) in item"
          :key="key"
          class="week-data-td"
          :style="`background:${temp.checked ? '#4e84fe' : ''}`"
          @click="handleClickTimeData(temp, index)"
        />
      </tr>
      <tr>
        <th class="week-first-name">星期\时</th>
        <th v-for="(item, index) in timeThArr" :key="index" class="week-first-num">
          {{ index % 2 === 0 ? item : '' }}
        </th>
      </tr>
    </table>
    <div
      v-show="is_show_mask"
      class="mask"
      :style="
        'width:' +
          maskWidth +
          'left:' +
          maskLeft +
          'height:' +
          maskHeight +
          'top:' +
          maskTop
      "
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      weekArr: [1, 2, 3, 4, 5, 6, 0],
      timeThArr: [],
      timeTdArr: [],
      dialogVisible: false,
      weekEnum: {
        Monday: '星期一',
        Tuesday: '星期二',
        Wednesday: '星期三',
        Thursday: '星期四',
        Friday: '星期五',
        Saterday: '星期六',
        Sunday: '星期日'
      },
      tableData: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saterday: [],
        Sunday: []
      },
      loading: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      is_show_mask: false
    }
  },
  computed: {
    maskWidth() {
      return `${Math.abs(this.endX - this.startX)}px;`
    },

    maskHeight() {
      return `${Math.abs(this.endY - this.startY)}px;`
    },

    maskLeft() {
      return `${Math.min(this.startX, this.endX) - 490}px;`
    },

    maskTop() {
      return `${Math.min(this.startY, this.endY) - 210}px;`
    }
  },
  created() {
    this.setTableConfig()
  },
  methods: {
    setTableConfig() {
      const timeThArr = Array.from(new Array(24).keys())
      this.timeThArr = timeThArr
      const tableList = this.tableData
      const tableListKey = Object.keys(this.tableData)

      for (let i = 0; i < tableListKey.length; i++) {
        const cur = tableListKey[i]
        this.timeThArr.map((temp, key) => {
          tableList[cur].push({
            key: key + i * 24,
            checked: false
          })
        })
      }

      this.tableData = tableList
    },
    handleClickTimeData(obj, index) {
      const tableList = _.clone(this.tableData)
      _.map(tableList[index], (item) => {
        if (item.key === obj.key) {
          item.checked = !item.checked
        }
      })
      console.log(tableList, 'tableListpppp')
      this.tableData = tableList
    },
    reset() {
      const tableList = _.clone(this.tableData)
      _.map(tableList, (item) => {
        _.map(item, (temp) => {
          temp.checked = false
        })
      })
      this.tableData = tableList
    },
    handleMouseDown(e) {
      e = e || window.event
      this.is_show_mask = true
      this.startX = e.x || e.clientX
      this.startY = e.y || e.clientY
      this.endX = e.x || e.clientX
      this.endY = e.y || e.clientY
      document.body.addEventListener('mousemove', this.handleMouseMove)
      document.body.addEventListener('mouseup', this.handleMouseUp)
      e.preventDefault()
      e.stopPropagation()
    },
    handleMouseMove(e) {
      e = e || window.event
      this.endX = e.x || e.clientX
      this.endY = e.y || e.clientY
      this.handleDomSelect('move')
    },
    handleMouseUp() {
      document.body.removeEventListener('mousemove', this.handleMouseMove)
      document.body.removeEventListener('mouseup', this.handleMouseUp)
      this.is_show_mask = false
      this.handleDomSelect('up')
      this.resetXY()
    },
    resetXY() {
      this.startX = 0
      this.startY = 0
      this.endX = 0
      this.endY = 0
    },
    handleDomSelect(isType) {
      const dom_mask = window.document.querySelector('.mask')
      const rect_select = dom_mask.getClientRects()[0]
      const tableListKey = Object.keys(this.tableData)
      // console.log('rect_select', rect_select)

      const selectKeys = []
      document.querySelectorAll('.week-data-td').forEach((node, index) => {
        const rects = node.getClientRects()[0]
        const styles = node.style
        if (this.collide(rects, rect_select) === true) {
          selectKeys.push(index)
          if (isType === 'move') {
            if (styles.backgroundColor) {
              if (styles.backgroundColor === 'rgb(78, 132, 254)' && selectKeys.includes(index)) {
                styles.backgroundColor = 'white'
              }
              if (styles.backgroundColor === 'white') {
                styles.backgroundColor = 'rgb(78, 132, 254)'
              }
            } else {
              styles.backgroundColor = 'rgb(142, 175, 252)'
            }
          }
        } else {
          if (styles.backgroundColor === 'rgb(142, 175, 252)' && !selectKeys.includes(index)) {
            styles.backgroundColor = ''
          }
        }
      })
      if (selectKeys.length < 2) return
      const tableList = _.clone(this.tableData)

      for (let i = 0; i < tableListKey.length; i++) {
        const cur = tableListKey[i]
        _.map(tableList[cur], (temp) => {
          if (selectKeys.indexOf(temp.key) > -1) {
            if (isType === 'up') {
              temp.checked = !temp.checked
            }
          }
          return temp
        })
      }
      this.tableData = tableList
    },

    collide(rect1, rect2) {
      const maxX = Math.max(rect1.x + rect1.width, rect2.x + rect2.width)
      const maxY = Math.max(rect1.y + rect1.height, rect2.y + rect2.height)
      const minX = Math.min(rect1.x, rect2.x)
      const minY = Math.min(rect1.y, rect2.y)
      if (maxX - minX <= rect1.width + rect2.width && maxY - minY <= rect1.height + rect2.height) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .grad-table {
    position: relative;
    user-select: none;
    width: 540px;
  }
  .grad-table .mask {
    position: absolute;
    background: #409eff;
    border: 1px dashed #c2d0f3;
    opacity: 0.4;
    z-index: 1000;
  }
  .grad-table table.gridtable {
    width: 100%;
    height: 100%;
    border: none;
  }
  .grad-table table.gridtable tr {
    height: 24px;
    line-height: 21px;
  }
  .grad-table table.gridtable .week-first-td {
    display: inline-block;
    margin-right: 8px;
    font-size: 13px;
    font-weight: 440;
  }
  .grad-table table.gridtable .week-data-td {
    position: relative;
    display: inline-block;
    height: 25px;
    width: 20px;
    line-height: 20px;
    font-size: 10px;
    border: 1px solid #c2d0f3;
    cursor: pointer;
  }
  .week-first-num {
    display: inline-block;
    width: 20px;
    height: 22px;
    font-weight: 440!important;
    margin-top: 2px;
  }
  .week-first-name {
    display: inline-block;
    margin-right: 3px;
    font-size: 13px;
    font-weight: 440;
  }
</style>
