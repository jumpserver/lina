<template>
  <el-tooltip
    v-model="iShowTip"
    :manual="true"
    :content="tipText"
    class="item"
    effect="dark"
    placement="bottom-start"
  >
    <div class="content">
      <span class="switch" @click="onSwitchChange">
        <i class="fa fa-bars" :class="{'switch-active':isActive}" />
      </span>
      <transition name="slide-fade">
        <ul
          v-show="isActive"
          class="nav"
        >
          <li
            v-for="(view, index) of views"
            :key="view.name"
            :index="index"
            class="nav-item"
            :class="{'nav-active': view.name == currentViewName}"
            @click="handleSelectView(view)"
          >
            <i class="nav-icon" :class="view.meta.icon" />
            <span class="nav-title">{{ view.meta.title }}</span>
          </li>
        </ul>
      </transition>
    </div>
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
      showTip: true,
      currentViewName: '',
      isActive: JSON.parse(localStorage.getItem('showViewSwitcher')) || false
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
  created() {
    const getcurrentViewName = JSON.parse(localStorage.getItem('PreView'))?.name || this.currentViewRoute?.name || ''
    this.currentViewName = getcurrentViewName
  },
  methods: {
    async handleSelectView(key) {
      const routeName = key || '/'
      this.currentViewName = key?.name
      localStorage.setItem('PreView', JSON.stringify(key))
      // Next 之前要重置 init 状态，否则这些路由守卫就不走了
      await store.dispatch('app/reset')
      if (!this.tipHasRead) {
        this.tipHasRead = '1'
        this.iShowTip = false
      }
      this.$router.push(routeName)
    },
    onSwitchChange: _.throttle(function() {
      this.isActive = !this.isActive
      localStorage.setItem('showViewSwitcher', JSON.stringify(this.isActive))
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
.menu-main.el-menu {
  background-color: transparent;
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
.el-menu-item.is-active {
  font-weight: bold;
}
.menu-main.mobile-view-switch >>> .el-submenu__icon-arrow {
  right: 10px;
}
.content{
  padding-right: 16px;
  .switch {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    vertical-align: top;
    font-size: 18px;
    transition: all .2s ease-in-out;
    &:hover {
      color: #333;
    }
    .switch-active {
      transform: rotate(90deg);
    }
  }
  .nav {
    padding: 0;
    display: inline-block;
    .nav-item {
      display: inline-block;
      color: #909399;
      font-size: 14px;
      cursor: pointer;
      padding: 0 4px;
      transition: all .3s ease-in-out;
      &:last-child {
        padding-right: 0;
      }
      &:hover {
        color: #676a6c;
        background-color: #e6e6e6;
      }
    }
    .nav-active {
      color: #333;
    }
    .nav-icon {
      display: inline-block;
      font-size: 16px;
      text-align: center;
      .nav-title {
        display: inline-block;
        font-size: 14px;
        color: #909399;
      }
    }
  }
  .slide-fade-enter-active {
    transition: all .3s cubic-bezier(1, .5, .8, .8);;
  }
  .slide-fade-leave-active {
    transition: all .3s cubic-bezier(1, 0.5, .8, 1);
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateX(1px);
    opacity: 0;
  }
}
</style>
