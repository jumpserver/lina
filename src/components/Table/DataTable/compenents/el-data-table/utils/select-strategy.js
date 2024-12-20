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
   * el-table 的 selection-change 事件不适用于开启跨页保存的情况。
   * 比如，当开启 persistSelection时，发生以下两个场景：
   * 1. 用户点击翻页
   * 2. 用户点击行首的切换全选项按钮，清空当前页多选项数据
   * 其中场景 1 应该保持 selected 不变；而场景 2 只应该从 selected 移除当前页所有行，保留其他页面的多选状态。
   * 但 el-table 的 selection-change 事件在两个场景中无差别发生，所以这里不处理这个事件
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
    // 获取当前所有已选择的项
    const selectedRows = this.elDataTable.data.filter(r => selection.includes(r))

    // 判断是否已全选
    const isSelected = this.elDataTable.data.every(r => selectable(r) && selectedRows.includes(r))

    this.elDataTable.data.forEach(r => {
      if (selectable(r)) {
        this.toggleRowSelection(r, isSelected)
      }
    })
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

    // 历史勾选的行已经不在当前页了，所以要将当前页的行数据和selected合并
    const mergeData = _.uniqWith([...data, ...selected], _.isEqual)

    mergeData.forEach(r => {
      const isSelected = !!selected.find(r2 => r[id] === r2[id])

      if (!this.elTable) {
        return
      }

      this.elTable.toggleRowSelection(r, isSelected)
    })
  }
}

export default function getSelectStrategy(elDataTable) {
  return elDataTable.persistSelection
    ? new StrategyPersistSelection(elDataTable)
    : new StrategyNormal(elDataTable)
}
