export function isColumnDraggable(column) {
  return (
    !!column.prop &&
    !column.fixed &&
    !column.pinOriginalFixed &&
    column.prop !== 'actions' &&
    !['selection', 'index', 'expand'].includes(column.type)
  )
}

export function reorderColumnsByHeader(columns, headerProps, movedProp) {
  const movedColumn = columns.find((column) => column.prop === movedProp)
  if (!movedColumn || !isColumnDraggable(movedColumn)) {
    return columns
  }

  // Fixed and utility columns retain their slots even when Element Plus groups
  // them differently in the rendered header.
  const movableColumns = columns.filter(isColumnDraggable)
  const movableByProp = new Map(movableColumns.map((column) => [column.prop, column]))
  const orderedProps = headerProps.filter((prop) => movableByProp.has(prop))
  if (
    orderedProps.length !== movableColumns.length ||
    new Set(orderedProps).size !== movableColumns.length
  ) {
    return columns
  }

  let index = 0
  const reordered = columns.map((column) =>
    movableByProp.has(column.prop) ? movableByProp.get(orderedProps[index++]) : column
  )
  return reordered.every((column, position) => column === columns[position]) ? columns : reordered
}
