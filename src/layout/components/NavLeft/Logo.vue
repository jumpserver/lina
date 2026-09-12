<template>
  <div :class="{ collapse: collapse }" class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <a v-if="collapse" key="collapse" class="sidebar-logo-link" @click="handleClick">
        <LogoSymbol v-if="isDefaultSymbol" class="sidebar-logo" />
        <img v-else :src="logoSrc" alt="logo" class="sidebar-logo" />
      </a>
      <a v-else key="expand" class="sidebar-logo-link" @click="handleClick">
        <span
          class="sidebar-logo-artwork"
          :class="{ 'has-animated-symbol': logoTextSrc === defaultLogo }"
        >
          <img :src="logoTextSrc" alt="logo" class="sidebar-logo-text" />
          <LogoSymbol v-if="logoTextSrc === defaultLogo" class="sidebar-logo-symbol" />
        </span>
      </a>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFirstAccessibleChildPath } from '@/utils/vue'
import defaultLogo from '@/assets/img/logo_text_white_spaced.png'
import LogoSymbol from './LogoSymbol.vue'
import { isDefaultInterfaceLogo } from '@/utils/interfaceLogo'

export default {
  name: 'SidebarLogo',
  components: { LogoSymbol },
  props: {
    collapse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { defaultLogo }
  },
  computed: {
    ...mapGetters(['viewRoutes', 'publicSettings']),
    logoTextSrc() {
      const logoIndex = this.publicSettings.INTERFACE?.logo_index
      return isDefaultInterfaceLogo(logoIndex) ? defaultLogo : logoIndex.trim()
    },
    isDefaultSymbol() {
      return isDefaultInterfaceLogo(this.logoSrc)
    },
    logoSrc() {
      return this.publicSettings.INTERFACE?.logo_logout?.trim()
    }
  },
  created() {},
  methods: {
    handleClick() {
      const currentPath = this.$route.path
      const matchingRoute = this.viewRoutes.find((route) => currentPath.startsWith(route.path))

      if (matchingRoute) {
        const redirect = matchingRoute.redirect
        const rootPath = matchingRoute.meta?.fullPath || matchingRoute.path
        const targetPath =
          (typeof redirect === 'string' && redirect) ||
          (redirect && typeof redirect === 'object' ? redirect : '') ||
          getFirstAccessibleChildPath(rootPath) ||
          rootPath
        this.$router.push(targetPath)
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: $headerHeight;
  line-height: $headerHeight;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    padding: 5px;
    display: inline-block;

    & .sidebar-logo {
      color: #fff;
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 0;
    }

    & .sidebar-logo-text {
      display: block;
      height: calc(#{$headerHeight} - 10px);
    }

    & .sidebar-logo-artwork {
      position: relative;
      display: inline-block;
      vertical-align: top;
    }

    & .has-animated-symbol .sidebar-logo-text {
      // Keep the original wordmark; the SVG replaces only the bitmap symbol.
      clip-path: inset(0 0 0 19.52%);
    }

    & .sidebar-logo-symbol {
      position: absolute;
      top: 0;
      left: 1.5244%;
      width: 16.4634%;
      height: 100%;
      color: #fff;
      pointer-events: none;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: $headerHeight;
      font-size: 14px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      vertical-align: middle;
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
