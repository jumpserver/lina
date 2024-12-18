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
 * 跨页保存多选策略。手动维护selected
 */
class StrategyPersistSelection extends StrategyAbstract {
  /**
   * 批量处理表格选择状态
   */
  batchProcessSelection(rows) {
    // 先清空当前页的选择状态
    this.elTable.clearSelection()

    // 直接处理当前页的选择状态
    rows.forEach(row => {
      this.elTable.toggleRowSelection(row, true)
    })
  }

  /**
   * 处理选择变化事件
   */
  onSelectionChange(val) {
    const { id, data, selected } = this.elDataTable

    // 如果当前页选中数量等于当前页数据量，说明是全选操作
    const isSelectAll = val.length === data.length

    if (isSelectAll) {
      // 将当前页所有数据添加到 selected 中（如果还没有添加的话）
      data.forEach(row => {
        const foundIndex = selected.findIndex(r => r[id] === row[id])
        if (foundIndex === -1) {
          selected.push(row)
        }
      })
    } else {
      // 非全选情况：将不在 val 中的当前页数据从 selected 中移除
      const selectedIds = new Set(val.map(r => r[id]))
      data.forEach(row => {
        const foundIndex = selected.findIndex(r => r[id] === row[id])
        if (!selectedIds.has(row[id]) && foundIndex > -1) {
          selected.splice(foundIndex, 1)
        }
      })
    }

    // 触发事件，传递所有选中的数据
    this.elDataTable.$emit('selection-change', selected)
  }

  /**
   * 用户切换某一行的多选
   */
  onSelect(selection, row) {
    const { id, selected } = this.elDataTable
    const foundIndex = selected.findIndex(r => r[id] === row[id])
    const isSelected = selection.includes(row)

    if (isSelected && foundIndex === -1) {
      selected.push(row)
    } else if (!isSelected && foundIndex > -1) {
      selected.splice(foundIndex, 1)
    }

    // 只更新这一行的选择状态
    this.elTable.toggleRowSelection(row, isSelected)

    this.elDataTable.$emit('selection-change', selected)
  }

  /**
   * 用户切换当前页的多选
   */
  onSelectAll(selection, selectable = () => true) {
    const { id, selected, data } = this.elDataTable
    const selectableRows = data.filter(selectable)
    const isSelected = selection.length > 0

    if (isSelected) {
      // 将当前页所有可选择的数据添加到 selected 中
      const rowsToAdd = selectableRows.filter(row =>
        !selected.find(r => r[id] === row[id])
      )
      selected.push(...rowsToAdd)
      this.batchProcessSelection(selectableRows)
    } else {
      // 从 selected 中移除当前页的数据
      selectableRows.forEach(row => {
        const index = selected.findIndex(r => r[id] === row[id])
        if (index > -1) {
          selected.splice(index, 1)
        }
      })
      this.elTable.clearSelection()
    }

    this.elDataTable.$emit('selection-change', selected)
  }

  /**
   * toggleRowSelection和clearSelection管理elDataTable的selected数组
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

    if (!this.elTable) {
      return
    }

    // 先清空当前页选择状态
    this.elTable.clearSelection()

    // 只处理当前页的数据
    data.forEach(row => {
      const isSelected = selected.some(r => r[id] === row[id])
      if (isSelected) {
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
