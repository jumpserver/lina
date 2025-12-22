/**
 * Drawer 拖拽调整宽度功能
 * 用于 Element Plus el-drawer 组件的宽度拖拽调整
 */

/**
 * 初始化 drawer 拖拽功能
 * @param {Object} options - 配置选项
 * @param {Function} options.onWidthChange - 宽度变化回调函数
 * @param {number} options.minWidthRatio - 最小宽度比例，默认 0.2
 * @param {number} options.maxWidthRatio - 最大宽度比例，默认 0.8
 * @param {string} options.storageKey - localStorage 存储键名，默认 'drawerWidth'
 * @returns {Object} 包含 cleanup 方法的对象
 */
export function useDrawerDrag(options = {}) {
  const {
    onWidthChange,
    minWidthRatio = 0.2,
    maxWidthRatio = 0.8,
    storageKey = 'drawerWidth'
  } = options

  let dragHandle = null
  let observer = null

  const findDrawer = () => {
    const drawers = document.querySelectorAll('.el-drawer')
    return drawers.length > 0 ? drawers[drawers.length - 1] : null
  }

  const initDrag = element => {
    if (!element || element.querySelector('.el-drawer-drag-handle')) return

    // 创建拖拽手柄
    dragHandle = Object.assign(document.createElement('div'), {
      className: 'el-drawer-drag-handle',
      style: 'height:100%;width:5px;cursor:ew-resize;position:absolute;left:0;z-index:1000;'
    })

    // 确保 drawer 有相对定位
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative'
    }

    element.appendChild(dragHandle)

    // 拖拽逻辑
    dragHandle.onmousedown = e => {
      e.preventDefault()
      const startX = e.pageX
      const startWidth = element.offsetWidth
      const minWidth = window.innerWidth * minWidthRatio
      const maxWidth = window.innerWidth * maxWidthRatio

      const move = e => {
        const deltaX = startX - e.pageX
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
        element.style.width = `${newWidth}px`

        if (storageKey) {
          localStorage.setItem(storageKey, newWidth)
        }

        if (onWidthChange) {
          onWidthChange(newWidth)
        }
      }

      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        document.body.style.userSelect = ''
      }

      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    }
  }

  const start = () => {
    cleanup()

    // 立即尝试
    const element = findDrawer()
    if (element) {
      initDrag(element)
      return
    }

    // 如果没找到，使用 MutationObserver 监听
    observer = new MutationObserver(() => {
      const element = findDrawer()
      if (element) {
        initDrag(element)
        observer.disconnect()
        observer = null
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 超时保护
    setTimeout(() => {
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }, 2000)
  }

  const cleanup = () => {
    if (dragHandle?.parentNode) {
      dragHandle.remove()
      dragHandle = null
    }
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return {
    start,
    cleanup
  }
}

