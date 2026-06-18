import { h, resolveComponent } from 'vue'

function ElDataTableColumn(props, { attrs, slots }) {
  const columnProps = { ...attrs }
  if (props.align !== undefined) {
    columnProps.align = props.align
  }

  const children = props.columns?.length
    ? () =>
        props.columns.map((column, index) =>
          h(ElDataTableColumn, {
            key: column.prop || index,
            align: props.align,
            ...column
          })
        )
    : slots

  return h(resolveComponent('el-table-column'), columnProps, children)
}

ElDataTableColumn.props = {
  align: String,
  columns: {
    type: Array,
    default: null
  }
}

export default ElDataTableColumn
