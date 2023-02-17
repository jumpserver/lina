<template>
  <el-tooltip
    v-model="iShowTip"
    :content="tipText"
    :manual="true"
    class="item"
    effect="dark"
    placement="bottom-start"
  >
    <el-menu
      :class="mode"
      :default-active="currentViewRoute.name"
      :mode="mode"
      class="menu-main"
      @select="handleSelectView"
    >
      <el-menu-item
        v-for="view of views"
        :key="view.name"
        :index="view.name"
      >
        <svg-icon :icon-class="view.meta.icon" class="icons" />
        <span slot="title" class="icons-title">{{ view.meta.title }}</span>
      </el-menu-item>
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
        if (this.views.length < 1) {
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
  created() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent)) {
      this.showTip = false
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
  border-right: none !important;

  ::v-deep .el-submenu .el-submenu__title {
    height: 40px;
    line-height: 40px;
    border-bottom: none;
  }

  &.el-menu--horizontal {
    border-bottom: none;
  }

  & > > > .el-icon-arrow-down {
    font-size: 13px;
    color: #606266;
  }

  .el-menu-item {
    height: 36px;
    line-height: 26px;
    padding: 4px 24px;

    &:hover {
      background-color: var(--menu-hover);
    }

    &:focus {
      background-color: transparent;
    }
  }
}

.el-menu--horizontal .el-menu .el-menu-item {
  display: inline-block !important;
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
  color: #606266 !important;
}

.icons {
  vertical-align: middle !important;
  font-size: 16px;
  text-align: center;
  color: #1F2329;
  margin-right: 10px;
}

.icons-title {
  display: inline-block;
  font-size: 14px;
}

.el-menu-item.is-active {
  font-weight: bold;
  color: var(--menu-text-active);
  border-left: 4px solid var(--menu-text-active);
}

.menu-main.mobile-view-switch > > > .el-submenu__icon-arrow {
  right: 10px;
}
</style>
