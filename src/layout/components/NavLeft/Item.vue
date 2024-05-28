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
      if (icon.startsWith('fa')) {
        vNodes.push(<i class={`fa ${icon}`} />)
      } else {
        vNodes.push(<svg-icon icon-class={icon}/>)
      }
    }

    if (title) {
      vNodes.push(<span slot='title'>{title}</span>)
    }
    return vNodes
  }
}
</script>
