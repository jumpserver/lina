<template>
  <div :class="{ collapse: !sidebar.opened, 'logo-mode-split': logoMode === 'split' }" class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <a v-if="logoMode === 'split'" key="collapse" class="sidebar-logo-link" @click="handleClick">
        <img :src="logoSrc" alt="logo" class="sidebar-logo">
        <span v-if="sidebar.opened" :style="logoTitleStyle" class="sidebar-title">{{ logoTitle }}</span>
      </a>
      <a v-else key="expand" class="sidebar-logo-link" @click="handleClick">
        <img :src="logoTextSrc" alt="logo" class="sidebar-logo-text">
      </a>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SidebarLogo',
  computed: {
    ...mapGetters(['viewRoutes', 'publicSettings', 'logoMode', 'sidebar']),
    // eslint-disable-next-line vue/return-in-computed-property
    logoTextSrc() {
      return this.publicSettings['INTERFACE']['logo_index']
    },
    logoSrc() {
      return this.publicSettings['INTERFACE']['logo_logout']
    },
    logoTitle() {
      return this.publicSettings['INTERFACE']['login_title']
    },
    logoTitleStyle() {
      const minFontSize = 10
      const maxFontSize = 16
      const titleLength = (this.logoTitle || '').trim().length || 1
      const sidebarWidth = 200
      const marginLeft = 10
      const horizontalPadding = 10
      const logoWidth = 32
      const gap = 8
      const letterSpacing = 1.5
      const availableWidth = sidebarWidth - marginLeft - horizontalPadding - logoWidth - gap
      const availableTextWidth = Math.max(
        minFontSize,
        availableWidth - Math.max(0, titleLength - 1) * letterSpacing
      )
      const fontSize = Math.max(minFontSize, Math.floor(availableTextWidth / titleLength))

      return {
        fontSize: `${Math.min(maxFontSize, fontSize)}px`,
        maxWidth: `${availableWidth}px`
      }
    }
  },
  methods: {
    handleClick() {
      const currentPath = this.$route.path
      const matchingRoute = this.viewRoutes.find(route => currentPath.startsWith(route.path))

      if (matchingRoute) {
        this.$router.push(matchingRoute.redirect)
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/variables.scss';

.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: $headerHeight;
  line-height: $headerHeight;
  text-align: center;
  overflow: hidden;

  // &.collapse.logo-mode-split {
  //   .sidebar-logo-link {
  //     margin-left: 8px;
  //   }
  // }

  & .sidebar-logo-link {
    box-sizing: border-box;
    display: flex;
    gap: 8px;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 5px;
    margin-left: 10px;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 0;
    }

    & .sidebar-logo-text {
      height: calc(#{$headerHeight} - 10px);
    }

    & .sidebar-title {
      display: inline-block;
      flex: 1;
      min-width: 0;
      color: #fff;
      font-weight: 600;
      line-height: $headerHeight;
      font-size: 16px;
      text-align: left;
      vertical-align: middle;
      letter-spacing: 1.5px;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  &.collapse {
    height: $headerHeight;
    line-height: $headerHeight;
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>
