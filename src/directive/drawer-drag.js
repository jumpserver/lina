import Vue from 'vue'

Vue.directive('el-drawer-drag-width', {
  bind(el, binding, vnode, oldVnode) {
    const drawerEle = el.querySelector('.el-drawer')
    // 创建触发拖拽的元素
    const dragItem = document.createElement('div')
    // 将元素放置到抽屉的左边边缘
    dragItem.style.cssText = 'height: 100%;width: 5px;cursor: w-resize;position: absolute;left: 0;'
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
      }
      document.onmouseup = function(e) {
        // 拖拽时结束时，取消禁用文本选中
        document.body.style.userSelect = 'initial'
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
})
