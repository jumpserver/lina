// 鼠标可移入tooltip功能
import { Table } from 'element-ui'
import { getCell, getColumnByCell } from 'element-ui/packages/table/src/util'
import { getStyle, hasClass } from 'element-ui/src/utils/dom'
import { copy } from './common'

Object.assign(Table.components.TableBody.methods, {
  handleCellMouseEnter(event, row) {
    const { table } = this
    const cell = getCell(event)

    if (cell) {
      const column = getColumnByCell(table, cell)
      table.hoverState = { cell, column, row }
      const { hoverState } = table
      table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event)
    }

    // 判断是否text-overflow, 如果是就显示tooltip
    const cellChild = event.target.querySelector('.cell')
    if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
      return
    }
    // use range width instead of scrollWidth to determine whether the text is overflowing
    // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
    const range = document.createRange()
    range.setStart(cellChild, 0)
    range.setEnd(cellChild, cellChild.childNodes.length)
    const rangeWidth = range.getBoundingClientRect().width
    const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
    if (
      (rangeWidth + padding > cellChild.offsetWidth ||
          cellChild.scrollWidth > cellChild.offsetWidth) &&
        this.$refs.tooltip
    ) {
      const { tooltip } = this.$refs
      const { tooltipEnterable } = this.table
      const showTooltip = () => {
        this.tooltipContent = cell.innerText || cell.textContent
        tooltip.referenceElm = cell
        tooltip.doDestroy()
        tooltip.setExpectedState(true)
        this.activateTooltip(tooltip)
        tooltip.$refs.popper.style.cursor = 'pointer'
        // 点击复制
        tooltip.$refs.popper.onclick = () => {
          copy(this.tooltipContent)
        }
      }
      if (tooltipEnterable && tooltip.showPopper) {
        clearTimeout(tooltip.timeoutEnter)
        tooltip.timeoutEnter = setTimeout(() => {
          if (!tooltip.expectedState) {
            tooltip.handleClosePopper()
          }
          tooltip.timeoutEnter = null
        }, 100)
        return
      }
      if (!tooltipEnterable && tooltip.$refs.popper) {
        tooltip.$refs.popper.style.display = 'none'
      }
      showTooltip()
    }
  },
  handleCellMouseLeave(event) {
    const { tooltip } = this.$refs
    if (tooltip) {
      tooltip.setExpectedState(false)
      const { tooltipEnterable } = this.table
      if (tooltipEnterable) {
        clearTimeout(tooltip.timeoutLeave)
        tooltip.timeoutLeave = setTimeout(() => {
          if (!tooltip.expectedState) {
            tooltip.handleClosePopper()
          }
          tooltip.timeoutLeave = null
        }, 100)
      } else {
        tooltip.handleClosePopper()
      }
    }
    const cell = getCell(event)
    if (!cell) return

    const oldHoverState = this.table.hoverState || {}
    this.table.$emit(
      'cell-mouse-leave',
      oldHoverState.row,
      oldHoverState.column,
      oldHoverState.cell,
      event,
    )
  }
})

/**
 * @description 扩展el-table，实现当showOverflowTooltip时，鼠标可移入tooltip功能
 * @prop {Boolean} tooltipEnterable 仅在列属性showOverflowTooltip为true时生效，鼠标是否可进入到 tooltip 中，默认为true
*/
const ElTable = {
  extends: Table,
  props: {
    tooltipEnterable: {
      type: Boolean,
      default: true
    }
  }
}
export default (Vue) => {
  Vue.component('ElTable', ElTable)
}
