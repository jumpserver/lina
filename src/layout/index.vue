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
import AppMain from './components/AppMain.vue'
import NavHeader from './components/NavHeader/index.vue'
import NavLeft from './components/NavLeft/index.vue'
import { useResizeHandler } from '@/utils/vue/useResizeHandler'

export default {
  name: 'Layout',
  routeViewShell: true,
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  // 页面内各分区共用同一套间距，窄屏只在布局根上收紧一次。
  --page-inline-padding: 20px;
  --page-content-top-padding: 12px;
  --page-content-bottom-padding: 22px;
  --page-section-gap: 8px;
  --sidebar-footer-height: 44px;
  --list-viewport-bottom-offset: var(--sidebar-footer-height);

  &.mobile.openSidebar {
    position: fixed;
    inset: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  position: fixed;
  z-index: 1000;
  top: $headerHeight;
  right: 0;
  bottom: 0;
  left: 0;
}

.fixed-header {
  position: relative;
  z-index: 1002;
  flex: 0 0 $headerHeight;
  width: 100%;
  min-width: 0;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.22),
    0 6px 14px rgba(0, 0, 0, 0.14);
}

.mobile .fixed-header {
  width: 100%;
}

@media screen and (max-width: 767px) {
  .app-wrapper {
    --page-inline-padding: 12px;
    --page-content-top-padding: 10px;
    --page-content-bottom-padding: 14px;
    --list-viewport-bottom-offset: var(--page-section-gap);
  }
}

@media screen and (max-width: 480px) {
  .app-wrapper {
    --page-inline-padding: 8px;
    --page-content-bottom-padding: 10px;
  }
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
