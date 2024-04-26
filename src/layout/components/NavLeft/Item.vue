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
    if (icon) {
      vNodes.push(<svg-icon icon-class={icon}/>)
    } else {
      vNodes.push(<svg-icon icon-class={'dashboard'}/>)
    }

    if (title) {
      vNodes.push(<span slot='title'>{title}</span>)
    }
    return vNodes
  }
}
</script>
