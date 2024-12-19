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

    // 定义 tooltip 样式
    const tooltipStyle = {
      position: 'fixed',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      display: 'none'
    }

    if (icon) {
      if (icon.startsWith('fa-')) {
        vNodes.push(<i class={`fa ${icon}`} />)
      } else {
        vNodes.push(<svg-icon icon-class={icon}/>)
      }
    }

    if (title) {
      // 创建 tooltip div
      const tooltip = <div class='menu-tooltip' style={tooltipStyle}>{title}</div>

      // 创建带有事件处理的 span
      const titleSpan = (
        <span
          slot='title'
          style={ellipsisStyle}
          onMouseenter={(e) => {
            const el = e.target
            const tooltip = el.parentNode.querySelector('.menu-tooltip')

            // 检查文本是否溢出
            if (el.scrollWidth > el.offsetWidth) {
              const rect = el.getBoundingClientRect()
              tooltip.style.left = rect.right + 10 + 'px'
              tooltip.style.top = rect.top + 'px'
              tooltip.style.display = 'block'
            }
          }}
          onMouseleave={(e) => {
            const tooltip = e.target.parentNode.querySelector('.menu-tooltip')
            tooltip.style.display = 'none'
          }}
        >
          {title}
          {tooltip}
        </span>
      )

      vNodes.push(titleSpan)
    }
    return vNodes
  }
}
</script>

<style scoped>
::v-deep(.el-menu-item),
::v-deep(.el-submenu__title) {
  overflow: hidden;
  white-space: nowrap;
}

.menu-tooltip {
  transition: opacity 0.3s;
  pointer-events: none;
}

.menu-tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent rgba(0, 0, 0, 0.8) transparent transparent;
}
</style>
