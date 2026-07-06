<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <div :class="{ 'fixed-header': fixedHeader }" class="disabled-when-print">
      <NavHeader />
    </div>
    <div :class="{ hasTagsView: needTagsView }" class="main-container">
      <NavLeft class="sidebar-container disabled-when-print" />
      <app-main />
    </div>
  </div>
</template>

<script>
import { AppMain, NavHeader } from './components'
import NavLeft from './components/NavLeft/index.vue'
import { useResizeHandler } from '@/utils/vue/useResizeHandler'

export default {
  name: 'Layout',
  components: {
    NavLeft,
    NavHeader,
    AppMain
  },
  setup() {
    useResizeHandler()
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return true
      // return this.$store.state.settings.fixedHeader
    },
    needTagsView() {
      return false
      // return this.$store.state.settings.tagsView
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/mixin' as *;
@use '@/styles/variables' as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  // 导航栏是 position:fixed（脱离文档流），在此为它预留一次性的顶部空间。
  // 统一放在 app-wrapper 上，避免各路由（console / settings）因 main-container 偏移方式不同
  // 而出现「有的留白、有的顶到导航栏下」的不一致。
  padding-top: $headerHeight;
  box-sizing: border-box;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: 100%;
  transition: width 0.28s;
}

.mobile .fixed-header {
  width: 100%;
}

@media print {
  .disabled-when-print {
    display: none;
    width: 100%;
  }
  .enabled-when-print {
    display: inherit !important;
  }
  .print-margin {
    margin-top: 10px;
  }
  .drawer-bg {
    display: none;
  }
  .main-container {
    margin-left: 0 !important;
  }
  //.fixed-header{
  //  width: 100% !important;
  //}
}
</style>
