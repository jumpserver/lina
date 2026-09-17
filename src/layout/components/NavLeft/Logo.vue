<template>
  <div :class="{ collapse: collapse }" class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <a v-if="collapse" key="collapse" class="sidebar-logo-link" @click="handleClick">
        <span v-if="isDefaultSymbol" role="img" aria-label="JumpServer">
          <LogoSymbol class="sidebar-logo" />
        </span>
        <img v-else :src="logoSrc" alt="logo" class="sidebar-logo" />
      </a>
      <a v-else key="expand" class="sidebar-logo-link" @click="handleClick">
        <img :src="logoTextSrc" alt="logo" class="sidebar-logo-text" />
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
  transition: opacity 200ms ease-out;
}

.sidebarLogoFade-enter-from,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: $headerHeight;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;

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
      width: auto;
      max-width: 100%;
      object-fit: contain;
    }
  }

  &.collapse {
    height: $headerHeight;
    .sidebar-logo {
      margin-right: 0;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebarLogoFade-enter-active {
    transition: none;
  }
}
</style>
