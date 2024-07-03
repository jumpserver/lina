<template>
  <div :class="{'collapse':collapse}" class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <a v-if="collapse" key="collapse" class="sidebar-logo-link" @click="handleClick">
        <img :src="logoSrc" alt="logo" class="sidebar-logo">
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
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'viewRoutes',
      'publicSettings'
    ]),
    // eslint-disable-next-line vue/return-in-computed-property
    logoTextSrc() {
      return this.publicSettings['INTERFACE']['logo_index']
    },
    logoSrc() {
      return this.publicSettings['INTERFACE']['logo_logout']
    }
  },
  created() {
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
@import "~@/styles/variables.scss";

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
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: $headerHeight;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
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
