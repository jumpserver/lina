<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <NavLeft class="sidebar-container disabled-when-print" />
    <div :class="{hasTagsView: needTagsView}" class="main-container">
      <div :class="{'fixed-header': fixedHeader}" class="disabled-when-print">
        <NavHeader />
      </div>
      <app-main />
      <Footer class="disabled-when-print" />
    </div>
  </div>
</template>

<script>
import { NavHeader, NavLeft, AppMain, Footer } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'Layout',
  components: {
    NavLeft,
    NavHeader,
    AppMain,
    Footer
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
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
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
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 55px)
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
    //.hideSidebar .fixed-header{
    //  width: 100% !important;
    //}
  }
</style>
