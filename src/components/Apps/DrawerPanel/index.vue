<template>
  <div ref="drawer" :class="{show: show}" class="drawer">
    <div v-if="modal" :style="{'background-color': modal ? 'rgba(0, 0, 0, .3)' : 'transparent'}" class="modal" />
    <div ref="panel" :style="{width: width, height: height }" class="drawer-panel">
      <div v-show="!show" ref="dragBox" class="handle-button">
        <i v-if="icon.startsWith('fa') || icon.startsWith('el')" :class="show ? 'el-icon-close': icon" />
        <img v-else :src="icon" alt="">
      </div>
      <div class="drawer-panel-item">
        <slot :drawer-panel-visible="show" />
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'DrawerPanel',
  props: {
    icon: {
      type: String,
      default: 'el-icon-setting'
    },
    width: {
      type: String,
      default: '440px'
    },
    height: {
      type: String,
      default: '400px'
    },
    modal: {
      type: Boolean,
      default: true
    },
    clickNotClose: {
      type: Boolean,
      default: false
    },
    expanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false,
      clientOffset: {}
    }
  },
  watch: {
    show(value) {
      if (value && !this.clickNotClose) {
        this.addEventClick()
      }
      this.$emit('toggle', this.show)
    },
    expanded(value) {
      if (value) {
        this.$refs.panel.style.top = '0px'
      } else {
        this.$refs.panel.style.top = 'auto'
        this.$refs.panel.style.bottom = '2px'
      }
    }
  },
  mounted() {
    this.init()
    this.insertToBody()
  },
  beforeDestroy() {
    const element = this.$refs.drawer
    element.remove()
    // window.removeEventListener('click', this.closeSidebar)
  },
  methods: {
    handleHeaderMoveUp(event) {
      this.handleMouseMoveUp(event)
    },
    handleHeaderMoveDown(event) {
      this.handleMoveMouseDown(event, true)
    },
    handleMoveMouseDown(event, isHeader = false) {
      const dragBox = this.$refs.dragBox
      const vm = this
      const rect = dragBox.getBoundingClientRect()
      const parentRect = dragBox.parentElement.getBoundingClientRect()
      const clientOffset = this.clientOffset
      clientOffset.clientX = event.clientX
      clientOffset.clientY = event.clientY

      const handleOnMouseMove = _.debounce(function(event) {
        const diffY = rect.top - parentRect.top
        const maxY = window.innerHeight - parentRect.height
        let parentY = event.clientY - diffY
        // 这个是拖动的 header, 不是 bar
        if (isHeader) {
          parentY = event.clientY - rect.height / 2
        }
        if (parentY < 0) {
          parentY = 0
        } else if (parentY > maxY) {
          parentY = maxY
        }
        if (vm.$refs.panel) {
          vm.$refs.panel.style.top = parentY + 'px'
        }
      })

      document.onmousemove = handleOnMouseMove
      document.onmouseup = function() {
        document.removeEventListener('mousemove', handleOnMouseMove)
        setTimeout(() => {
          document.onmousemove = null
          document.onmouseup = null
        }, 0)
      }
    },

    handleMouseMoveUp(event) {
      const clientOffset = this.clientOffset
      const clientX = event.clientX
      const clientY = event.clientY
      if (this.isDifferenceWithinThreshold(clientX, clientOffset.clientX) &&
        this.isDifferenceWithinThreshold(clientY, clientOffset.clientY)) {
        this.show = !this.show
      }
    },
    init() {
      this.$nextTick(() => {
        const dragBox = this.$refs.dragBox
        dragBox.addEventListener('mousedown', this.handleMoveMouseDown, false)
        dragBox.addEventListener('mouseup', this.handleMouseMoveUp, false)
      })
    },
    isDifferenceWithinThreshold(num1, num2, threshold = 5) {
      const difference = Math.abs(num1 - num2)
      return difference <= threshold
    },
    addEventClick() {
      // window.addEventListener('click', this.closeSidebar)
    },
    closeSidebar(evt) {
      const parent = evt.target.closest('.drawer-panel')
      if (!parent && evt.target.className === 'modal') {
        this.show = false
      }
    },
    insertToBody() {
      const element = this.$refs.drawer
      const body = document.querySelector('body')
      body.insertBefore(element, body.firstChild)
    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
  background: rgba(0, 0, 0, .3);
  z-index: -1;
}

.drawer-panel {
  position: fixed;
  bottom: 1px;
  right: -1px;
  width: 100%;
  min-width: 260px;
  user-select: none;
  transition: transform .25s cubic-bezier(.7, .3, .1, 1);
  box-shadow: 0 0 8px 4px #00000014;
  transform: translate(100%);
  background: #FFFFFF;
  z-index: 1200;
}

.drawer-panel-item {
  height: 100%;
}

.drawer-panel-item::-webkit-scrollbar-track {
  box-shadow: none;
  background-color: transparent;
}

.show {
  transition: all .3s cubic-bezier(.7, .3, .1, 1);
}

.show .modal {
  z-index: 1003;
  opacity: 1;
  width: 100%;
  height: 100%;
}

.show .drawer-panel {
  transform: translate(0);
}

.handle-button {
  position: absolute;
  bottom: 20%;
  left: -48px;
  width: 48px;
  height: 45px;
  line-height: 45px;
  box-sizing: border-box;
  text-align: center;
  font-size: 24px;
  border-radius: 20px 0 0 20px;
  z-index: 0;
  pointer-events: auto;
  color: #fff;
  background-color: #FFFFFF;
  box-shadow: 0 0 8px 4px #00000014;
  cursor: pointer;

  &:hover {
    left: -52px !important;
    width: 50px !important;
    transform: scale(1.06);
  }
  i {
    font-size: 20px;
    line-height: 45px;
    pointer-events: none;
  }
  img {
    width: 22px;
    height: 22px;
    transform: translateY(10%);
    margin-left: 3px;
    pointer-events: none;
  }
}
</style>
