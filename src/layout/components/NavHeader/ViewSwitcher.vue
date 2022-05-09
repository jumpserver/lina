<template>
  <el-tooltip
    v-model="iShowTip"
    :manual="true"
    :content="tipText"
    class="item"
    effect="dark"
    placement="right"
  >
    <el-menu
      :default-active="currentViewRoute.name"
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
          :index="view.name"
        >
          <i v-if="mode === 'horizontal'" class="icons" :class="view.meta.icon" />
          <span slot="title" class="icons-title">{{ view.meta.title }}</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-tooltip>
</template>

<script>
import { mapGetters } from 'vuex'
import store from '@/store'

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
    return {
      tipText: this.$t('common.ChangeViewHelpText'),
      showTip: true
    }
  },
  computed: {
    ...mapGetters([
      'currentViewRoute',
      'viewRoutes'
    ]),
    views() {
      return this.viewRoutes.filter((item) => {
        let show = item.meta?.showNavSwitcher
        if (typeof show === 'function') {
          show = show()
        }
        return show
      })
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
    },
    tipHasRead: {
      set(val) {
        localStorage.setItem('viewSwitcherTip', val)
      },
      get() {
        return localStorage.getItem('viewSwitcherTip')
      }
    },
    iShowTip: {
      get() {
        if (this.mode !== 'horizontal') {
          return false
        }
        if (this.views.length < 2) {
          return false
        }
        if (this.tipHasRead) {
          return false
        }
        return this.showTip
      },
      set(val) {
        this.showTip = val
      }
    }
  },
  methods: {
    async handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key] || '/'
      localStorage.setItem('PreView', key)
      // Next 之前要重置 init 状态，否则这些路由守卫就不走了
      await store.dispatch('app/reset')
      if (!this.tipHasRead) {
        this.tipHasRead = '1'
        this.iShowTip = false
      }
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
  &:hover {
    color: inherit;
    i {
      color: inherit;
    }
  }
  &:first-child {
    margin-left: 16px;
  }
  &:last-child {
    margin-right: 16px;
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
