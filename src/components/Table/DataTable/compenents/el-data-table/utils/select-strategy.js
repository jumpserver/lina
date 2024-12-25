/**
 * 两种多选策略：Normal 和 PersistSelection
 */

/**
 * 多选策略接口
 */
class StrategyAbstract {
  constructor(elDataTable) {
    this.elDataTable = elDataTable
    // 绑定this后可直接在template中使用
    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onSelectAll = this.onSelectAll.bind(this)
  }
  get elTable() {
    return this.elDataTable.$refs.table
  }
  onSelectionChange() {}
  onSelect() {}
  onSelectAll() {}
  toggleRowSelection() {}
  clearSelection() {}
  updateElTableSelection() {}
}

/**
 * 普通策略。由el-table维护selected
 */
class StrategyNormal extends StrategyAbstract {
  /**
   * normal模式下只需要监听selection-change事件
   */
  onSelectionChange(val) {
    this.elDataTable.selected = val
  }
  /**
   * toggleRowSelection和clearSelection的表现与el-table一致
   */
  toggleRowSelection(...args) {
    return this.elTable.toggleRowSelection(...args)
  }
  clearSelection() {
    return this.elTable.clearSelection()
  }
}

/**
 * 跨页保存多选策略。手动维护selected数组
 */
class StrategyPersistSelection extends StrategyAbstract {
  /**
   * el-table的selection-change事件不适用于开启跨页保存的情况。
   * 比如，当开启persistSelection时，发生以下两个场景：
   * 1. 用户点击翻页
   * 2. 用户点击行首的切换全选项按钮，清空当前页多选项数据
   * 其中场景1应该保持selected不变；而场景2只应该从selected移除当前页所有行，保留其他页面的多选状态。
   * 但el-table的selection-change事件在两个场景中无差别发生，所以这里不处理这个事件
   */

  /**
   * 用户切换某一行的多选
   */
  onSelect(selection, row) {
    const isChosen = selection.indexOf(row) > -1
    this.toggleRowSelection(row, isChosen)
  }
  /**
   * 用户切换当前页的多选
   */
  onSelectAll(selection, selectable = () => true) {
    const { id, selected, data } = this.elDataTable
    const selectableRows = data.filter(selectable)
    // const isSelected = !!selection.length

    // 创建已选择项的 id 集合，用于快速查找
    const selectedIds = new Set(selected.map(r => r[id]))
    const currentPageIds = new Set(selectableRows.map(row => row[id]))

    // 前页面的选中状态
    const currentPageSelectedCount = selectableRows.filter(row =>
      selectedIds.has(row[id])
    ).length

    // 判断是全选还是取消全选
    const shouldSelectAll = currentPageSelectedCount < selectableRows.length

    this.elTable.clearSelection()

    if (shouldSelectAll) {
      selectableRows.forEach(row => {
        if (!selectedIds.has(row[id])) selected.push(row)

        this.elTable.toggleRowSelection(row, true)

        // ! 这里需要触发事件，否则在 el-table 中无法触发 selection-change 事件
        this.elDataTable.$emit('toggle-row-selection', true, row)
      })
    } else {
      const newSelected = []

      selected.forEach(row => {
        if (!currentPageIds.has(row[id])) {
          newSelected.push(row)
        } else {
          this.elDataTable.$emit('toggle-row-selection', false, row)
        }
      })

      this.elDataTable.selected = newSelected
    }

    this.elDataTable.$emit('selection-change', this.elDataTable.selected)
  }
  /**
   * toggleRowSelection和clearSelection管理elDataTable的selected数组
   * 记得最后要将状态同步到el-table中
   */
  toggleRowSelection(row, isSelected) {
    const { id, selected } = this.elDataTable
    const foundIndex = selected.findIndex(r => r[id] === row[id])

    if (typeof isSelected === 'undefined') {
      isSelected = foundIndex <= -1
    }

    if (isSelected && foundIndex === -1) {
      selected.push(row)
    } else if (!isSelected && foundIndex > -1) {
      selected.splice(foundIndex, 1)
    }

    this.elDataTable.$emit('toggle-row-selection', isSelected, row)
    this.updateElTableSelection()
  }
  clearSelection() {
    this.elDataTable.selected = []
    this.updateElTableSelection()
  }
  /**
   * 将selected状态同步到el-table中
   */
  updateElTableSelection() {
    const { data, id, selected } = this.elDataTable
    const selectedIds = new Set(selected.map(r => r[id]))

    this.elTable.clearSelection()

    data.forEach(row => {
      const shouldBeSelected = selectedIds.has(row[id])
      if (!this.elTable) return

      if (shouldBeSelected) {
        this.elTable.toggleRowSelection(row, true)
      }
    })
  }
}

export default function getSelectStrategy(elDataTable) {
  return elDataTable.persistSelection
    ? new StrategyPersistSelection(elDataTable)
    : new StrategyNormal(elDataTable)
}
