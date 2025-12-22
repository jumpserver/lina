import { nextTick } from 'vue'

export function installDrawerDragDirective(app) {
  app.directive('el-drawer-drag-width', {
    mounted(el) {
      // Element Plus 的 el-drawer 使用 Teleport，需要等待下一个 tick 才能找到元素
      nextTick(() => {
        // 尝试从 document.body 查找 drawer（因为 Teleport 会渲染到 body）
        let drawerEle = document.querySelector('.el-drawer')
        // 如果没找到，尝试从当前元素查找
        if (!drawerEle) {
          drawerEle = el.querySelector('.el-drawer')
        }
        // 如果还是没找到，尝试从 el-drawer__wrapper 查找
        if (!drawerEle) {
          const wrapper = document.querySelector('.el-drawer__wrapper')
          if (wrapper) {
            drawerEle = wrapper.querySelector('.el-drawer')
          }
        }

        if (!drawerEle) {
          console.warn('el-drawer element not found for drag directive')
          return
        }

        // 创建触发拖拽的元素
        const dragItem = document.createElement('div')
        // 将元素放置到抽屉的左边边缘
        dragItem.style.cssText = 'height: 100%;width: 5px;cursor: ew-resize;position: absolute;left: 0;z-index: 1;'
        drawerEle.append(dragItem)

        dragItem.onmousedown = (downEvent) => {
          // 拖拽时禁用文本选中
          document.body.style.userSelect = 'none'
          document.onmousemove = function(moveEvent) {
            // 获取鼠标距离浏览器右边缘的距离
            let realWidth = document.body.clientWidth - moveEvent.pageX
            const width30 = document.body.clientWidth * 0.2
            const width80 = document.body.clientWidth * 0.8
            // 宽度不能大于浏览器宽度 80%，不能小于宽度的 20%
            realWidth = realWidth > width80 ? width80 : realWidth < width30 ? width30 : realWidth
            drawerEle.style.width = realWidth + 'px'
            localStorage.setItem('drawerWidth', realWidth)
          }
          document.onmouseup = function() {
            // 拖拽时结束时，取消禁用文本选中
            document.body.style.userSelect = 'initial'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      })
    }
  })
}

export default {
  install: installDrawerDragDirective
}
