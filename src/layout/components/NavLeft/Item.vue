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
    const vnodes = []

    if (icon) {
      // const cls = 'fa fa-' + icon
      // vnodes.push(<i class={cls} />)
      vnodes.push(<svg-icon icon-class={icon}/>)
    }

    if (title) {
      const iTitle = title.split(' ').map(item => {
        return _.capitalize(item)
      }).join(' ')
      vnodes.push(<span slot='title'>{iTitle}</span>)
    }
    return vnodes
  }
}
</script>
