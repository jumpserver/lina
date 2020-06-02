<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <div v-if="publicSettings.XPACK_ENABLED&&publicSettings.XPACK_LICENSE_IS_VALID">
          <img v-if="customSettings" :src="logo_index" class="sidebar-logo">
          <img v-else-if="logoText" :src="logoText" class="sidebar-logo-text">
        </div>
        <div v-else>
          <img :src="logoText" class="sidebar-logo-text">
        </div>
        <!--        <h1 class="sidebar-title">{{ title }}</h1>-->
      </router-link>
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
      title: 'JumpServer',
      logoText: require('@/assets/img/logo-text.png'),
      logo: require('@/assets/img/logo.png'),
      xpackData: {}
    }
  },
  computed: {
    ...mapGetters([
      'customSettings',
      'publicSettings'
    ]),
    logo_index() {
      return this.customSettings.logo_index
    }
  },
  created() {

  }
}
</script>

<style lang="scss" scoped>
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
  height: 70px;
  line-height: 60px;
  // background: #2b2f3a;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 0;
    }

    & .sidebar-logo-text {
      width: 165px;
      height: 50px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    height: 50px;
    line-height: 50px;
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
