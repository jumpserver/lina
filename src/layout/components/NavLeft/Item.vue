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

    const ellipsisStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
      display: 'inline-block'
    }

    const tooltipStyle = {
      position: 'fixed',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      display: 'none',
      transition: 'opacity 0.3s',
      pointerEvents: 'none'
    }

    if (icon) {
      if (icon.startsWith('fa-')) {
        vNodes.push(<i class={`fa ${icon}`} />)
      } else {
        vNodes.push(<svg-icon icon-class={icon}/>)
      }
    }

    if (title) {
      const titleSpan = (
        <span
          slot='title'
          style={ellipsisStyle}
          onMouseenter={(e) => {
            const el = e.target
            const tooltip = el.querySelector('.menu-tooltip')

            // 检查文本是否溢出
            if (el.scrollWidth > el.offsetWidth) {
              const rect = el.getBoundingClientRect()
              tooltip.style.left = rect.right + 10 + 'px'
              tooltip.style.top = rect.top + 'px'
              tooltip.style.display = 'block'
            }
          }}
          onMouseleave={(e) => {
            const tooltip = e.querySelector('.menu-tooltip')
            tooltip.style.display = 'none'
          }}
        >
          {title}
          <div class='menu-tooltip' style={tooltipStyle}>
            {title}
            <span class='tooltip-arrow'></span>
          </div>
        </span>
      )

      vNodes.push(titleSpan)
    }
    return vNodes
  }
}
</script>

<style>
.el-menu-item,
.el-submenu__title {
  overflow: hidden !important;
  white-space: nowrap !important;
}

.tooltip-arrow {
  position: absolute;
  left: -4px;
  top: 50%;
  margin-top: -4px;
  border: 4px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
}
</style>
