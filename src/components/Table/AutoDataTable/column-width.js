const MAX_CONTENT_WIDTH = 360
const MAX_SAMPLE_ROWS = 50

function getCellContentWidth(cell, range) {
  const style = getComputedStyle(cell)
  let width = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight)
  const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent.trim()) {
      continue
    }
    // A text range measures the full text even inside an ellipsized link. Using
    // scrollWidth or a block wrapper's width would retain the previous allocation.
    range.selectNodeContents(walker.currentNode)
    width += range.getBoundingClientRect().width
  }

  for (const element of cell.querySelectorAll('img, svg, .fa, .el-tag')) {
    const elementStyle = getComputedStyle(element)
    if (element.classList.contains('el-tag')) {
      width +=
        (Number.parseFloat(elementStyle.paddingLeft) || 0) +
        (Number.parseFloat(elementStyle.paddingRight) || 0) +
        2
    } else {
      width += element.getBoundingClientRect().width
    }
    width +=
      (Number.parseFloat(elementStyle.marginLeft) || 0) +
      (Number.parseFloat(elementStyle.marginRight) || 0) +
      8
  }
  return Math.ceil(width + 8)
}

export function getRenderedColumnWidths(root, columns) {
  const table = root?.querySelector('.el-table')
  if (!table?.offsetWidth) {
    return {}
  }
  const adaptiveColumns = new Map(
    columns.filter((col) => col.fitWidth !== false).map((col) => [col.prop, col])
  )
  const rows = Array.from(table.querySelectorAll('.el-table__body > tbody > tr')).slice(
    0,
    MAX_SAMPLE_ROWS
  )
  const widths = {}
  const range = document.createRange()
  for (const header of table.querySelectorAll('.el-table__header-wrapper th')) {
    const prop = header.querySelector('[data-column-prop]')?.dataset.columnProp
    const col = adaptiveColumns.get(prop)
    const columnClass = Array.from(header.classList).find((name) =>
      /^el-table_\d+_column_\d+$/.test(name)
    )
    if (!col || !columnClass) {
      continue
    }
    let width = 0
    for (const row of rows) {
      const cell = row.querySelector(`td.${columnClass} > .cell`)
      if (cell) {
        width = Math.max(width, getCellContentWidth(cell, range))
      }
    }
    // Bound unusually long values so one row cannot dominate the entire table.
    widths[prop] = Math.min(width, Number.parseFloat(col.contentMaxWidth) || MAX_CONTENT_WIDTH)
  }
  return widths
}
