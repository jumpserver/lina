<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props
    const vNodes = []

    // 定义文本溢出样式
    const ellipsisStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
      display: 'inline-block'
    }

    if (icon) {
      if (icon.startsWith('fa-')) {
        vNodes.push(<i class={`fa ${icon}`} />)
      } else {
        vNodes.push(<svg-icon icon-class={icon} />)
      }
    }

    if (title) {
      vNodes.push(
        <el-tooltip content={title} placement='right' effect='dark' open-delay={ 1000 }>
          <span style={ellipsisStyle}>{title}</span>
        </el-tooltip>
      )
    }
    return vNodes
  }
}
</script>
