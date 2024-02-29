<template>
  <div ref="drawer" :class="{show: show}" class="drawer">
    <div :style="{'background-color': modal ? 'rgba(0, 0, 0, .3)' : 'transparent'}" class="modal" />
    <div :style="{'width': width}" class="drawer-panel">
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
    modal: {
      type: Boolean,
      default: true
    },
    clickNotClose: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false
    }
  },
  watch: {
    show(value) {
      if (value && !this.clickNotClose) {
        this.addEventClick()
      }
      this.$emit('toggle', this.show)
    }
  },
  mounted() {
    this.init()
    this.insertToBody()
  },
  beforeDestroy() {
    const element = this.$refs.drawer
    element.remove()
    window.removeEventListener('click', this.closeSidebar)
  },
  methods: {
    init() {
      this.$nextTick(() => {
        const dragBox = this.$refs.dragBox
        const clientOffset = {}
        dragBox.addEventListener('mousedown', (event) => {
          const offsetX = dragBox.getBoundingClientRect().left
          const offsetY = dragBox.getBoundingClientRect().top
          const innerX = event.clientX - offsetX
          const innerY = event.clientY - offsetY

          clientOffset.clientX = event.clientX
          clientOffset.clientY = event.clientY
          document.onmousemove = function(event) {
            dragBox.style.left = event.clientX - innerX + 'px'
            dragBox.style.top = event.clientY - innerY + 'px'
            const dragDivTop = window.innerHeight - dragBox.getBoundingClientRect().height
            const dragDivLeft = window.innerWidth - dragBox.getBoundingClientRect().width
            dragBox.style.left = dragDivLeft + 'px'
            dragBox.style.left = '-48px'
            if (dragBox.getBoundingClientRect().top <= 0) {
              dragBox.style.top = '0px'
            }
            if (dragBox.getBoundingClientRect().top >= dragDivTop) {
              dragBox.style.top = dragDivTop + 'px'
            }
            event.preventDefault()
            event.stopPropagation()
          }
          document.onmouseup = function() {
            document.onmousemove = null
            document.onmouseup = null
          }
        }, false)
        dragBox.addEventListener('mouseup', (event) => {
          const clientX = event.clientX
          const clientY = event.clientY
          if (this.isDifferenceWithinThreshold(clientX, clientOffset.clientX) && this.isDifferenceWithinThreshold(clientY, clientOffset.clientY)) {
            this.show = !this.show
          }
        })
      })
    },
    isDifferenceWithinThreshold(num1, num2, threshold = 5) {
      const difference = Math.abs(num1 - num2)
      return difference <= threshold
    },
    addEventClick() {
      window.addEventListener('click', this.closeSidebar)
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
  top: 0;
  right: 0;
  width: 100%;
  min-width: 260px;
  height: 100vh;
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
    left: -50px !important;
    width: 50px !important;
    transform: scale(1.06);
  }
  i {
    font-size: 20px;
    line-height: 45px;
  }
  img {
    width: 22px;
    height: 22px;
    transform: translateY(10%);
    margin-left: 3px;
  }
}
</style>
