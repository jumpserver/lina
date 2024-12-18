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
   * @param {Array} rows 需要处理的行数据
   * @returns {Promise}
   */
  batchProcessSelection(rows) {
    return new Promise((resolve) => {
      // 先清空当前页的选择状态
      this.elTable.clearSelection()

      const batchSize = 50
      const batches = Math.ceil(rows.length / batchSize)

      const processBatch = (batchIndex) => {
        if (batchIndex >= batches) {
          // 所有批次处理完成后，关闭加载状态并resolve
          this.elDataTable.loading = false

          resolve()
          return
        }

        const start = batchIndex * batchSize
        const end = Math.min(start + batchSize, rows.length)

        rows.slice(start, end).forEach(row => {
          this.elTable.toggleRowSelection(row, true, false)
        })

        requestAnimationFrame(() => processBatch(batchIndex + 1))
      }

      requestAnimationFrame(() => processBatch(0))
    })
  }

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

    // 获取可选择的行
    const selectableRows = data.filter(selectable)

    // 使用selection参数来判断是全选还是取消全选
    const isSelected = selection.length > 0

    if (isSelected) {
      // 全选
      const rowsToAdd = selectableRows.filter(row =>
        !selected.find(r => r[id] === row[id])
      )
      selected.push(...rowsToAdd)

      // 触发选择事件
      rowsToAdd.forEach(row => {
        this.elDataTable.$emit('toggle-row-selection', true, row)
      })
    } else {
      // 取消全选
      // 1. 先找出当前页面中已选中的行
      const currentPageSelected = selectableRows.filter(row =>
        selected.find(r => r[id] === row[id])
      )

      // 2. 从selected中移除这些行
      currentPageSelected.forEach(row => {
        const index = selected.findIndex(r => r[id] === row[id])
        if (index > -1) {
          selected.splice(index, 1)
        }
      })

      // 3. 触发取消选择事件
      currentPageSelected.forEach(row => {
        this.elDataTable.$emit('toggle-row-selection', false, row)
      })
    }

    // 更新表格选择状态
    const selectedIds = new Set(selected.map(r => r[id]))
    const currentPageSelectedRows = data.filter(r => selectedIds.has(r[id]))

    return this.batchProcessSelection(currentPageSelectedRows)
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

    if (!this.elTable) {
      return Promise.resolve()
    }

    const selectedIds = new Set(selected.map(r => r[id]))
    const currentPageSelectedRows = data.filter(r => selectedIds.has(r[id]))

    return this.batchProcessSelection(currentPageSelectedRows)
  }
}

export default function getSelectStrategy(elDataTable) {
  return elDataTable.persistSelection
    ? new StrategyPersistSelection(elDataTable)
    : new StrategyNormal(elDataTable)
}
