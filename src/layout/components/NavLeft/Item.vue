<script>
import { toTitleCase } from '@/utils/common'

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
    }

    if (title) {
      const iTitle = toTitleCase(title)
      vNodes.push(<span slot='title'>{iTitle}</span>)
    }
    return vNodes
  }
}
</script>
