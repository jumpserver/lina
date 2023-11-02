import { Drawer } from 'element-ui'

const ElDrawer = {
  extends: Drawer,
  data() {
    return {
      wrapperMouseDowned: false
    }
  },
  mounted() {
    this.$el.onmousedown = (e) => {
      this.wrapperMouseDowned = e.target.classList.contains('el-drawer__container')
    }
  },
  methods: {
    handleWrapperClick() {
      if (this.wrapperClosable && this.wrapperMouseDowned) {
        this.closeDrawer()
      }
    }
  }
}

export default {
  install(Vue) {
    Vue.component(Drawer.name, ElDrawer)
  }
}
