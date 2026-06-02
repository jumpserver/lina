<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <div :class="{'fixed-header': fixedHeader}" class="disabled-when-print">
      <NavHeader />
    </div>
    <div :class="{hasTagsView: needTagsView}" class="main-container">
      <NavLeft class="sidebar-container disabled-when-print" />
      <app-main />
    </div>
  </div>
</template>

<script>
import { AppMain, NavHeader } from './components'
import NavLeft from './components/NavLeft/index.vue'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'Layout',
  components: {
    NavLeft,
    NavHeader,
    AppMain
  },
  mixins: [ResizeMixin],
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
  @use "@/styles/mixin" as *;
  @use "@/styles/variables" as *;

  .app-wrapper {
    @include clearfix;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    &.mobile.openSidebar{
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
    position: relative;
    z-index: 9;
    width: 100%;
    flex: 0 0 $headerHeight;
    transition: width 0.28s;
  }

  .main-container {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .mobile .fixed-header {
    width: 100%;
  }

  @media print {
    .disabled-when-print{
      display: none;
      width: 100%;
    }
    .enabled-when-print{
      display: inherit !important;
    }
    .print-margin{
      margin-top: 10px;
    }
    .drawer-bg{
      display: none;
    }
    .main-container{
      margin-left: 0 !important;
    }
    //.fixed-header{
    //  width: 100% !important;
    //}

  }
</style>
