<template>
  <el-menu
    default-active="activeIndex"
    class="menu-main"
    :class="mode"
    :mode="mode"
    @select="handleSelectView"
  >
    <el-submenu
      index="2"
      popper-class="view-switcher"
    >
      <template slot="title">
        <span class="title-label">
          <i class="fa fa-bars" />
          <span>{{ $t('common.nav.View') }}</span>
        </span>
      </template>
      <el-menu-item
        v-for="view of views"
        :key="view.name"
        v-perms="view.perms"
        :index="view.name"
      >
        <i v-if="mode === 'horizontal'" class="icons" :class="view.meta.icon" />
        <span slot="title" class="icons-title">{{ view.meta.title }}</span>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ViewSwitcher',
  props: {
    showTitle: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'horizontal'
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters([
      'currentViewRoute'
    ]),
    views() {
      return this.$store.state.permission.addRoutes.filter(
        item => item.meta?.showNavSwitcher
      )
    },
    viewsMapper() {
      const mapper = {}
      for (const view of this.views) {
        mapper[view.name] = view
      }
      return mapper
    },
    currentView() {
      return this.viewsMapper[this.currentViewRoute.name]
    }
  },
  created() {
  },
  methods: {
    handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key] || '/'
      this.$router.push(routeName)
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-main.el-menu {
  background-color: transparent;
  // margin-top: -5px;
  ::v-deep .el-submenu .el-submenu__title {
    height: 55px;
    line-height: 55px;
    border-bottom: none;
  }
  &.el-menu--horizontal {
    border-bottom: none;
  }
  &>>> .el-icon-arrow-down {
    font-size: 13px;
    color: #606266;
  }
}

.el-menu--horizontal .el-menu .el-menu-item {
  display: inline-block!important;
  padding: 10px 10px;
  text-align: center;
  height: 70px;
  width: 70px;
  &:hover {
    color: inherit;
    i {
      color: inherit;
    }
  }
  &:first-child {
    margin-left: 20px;
  }
  &:last-child {
    margin-right: 20px;
  }
}
.el-submenu.is-opened {
  background-color: transparent;
}
.title-label {
  padding-left: 12px;
  font-size: 14px;
  vertical-align: unset;
  color: #606266!important;
}
.icons {
  display: block;
  font-size: 23px;
  text-align: center;
}
.icons-title {
  display: inline-block;
  font-size: 14px;
}
.el-menu-item.is-active {
  font-weight: bold;
}
.menu-main.mobile-view-switch >>> .el-submenu__icon-arrow {
  right: 10px;
}

</style>
