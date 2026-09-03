<template>
  <Page
    v-bind="$attrs"
    :class="{ 'has-tab-navigation': tabIndices.length > 1 }"
    :title="title"
    class="tab-page"
  >
    <div :class="{ 'has-tab-navigation': tabIndices.length > 1 }" class="tab-page-wrapper">
      <div v-if="tabIndices.length > 1 || $slots.headingRightSide" class="tab-page-submenu">
        <el-tabs
          v-if="tabIndices.length > 1"
          v-model="iActiveMenu"
          class="page-submenu"
          @tab-click="handleTabClick"
        >
          <template v-for="item in tabIndices" :key="item.name">
            <el-tab-pane :disabled="item.disabled" :name="item.name">
              <template #label>
                <div class="tab-page-submenu-item-wrapper">
                  <Icon v-if="item.icon" :icon="item.icon" class="pre-icon" />
                  {{ toSentenceCase(item.title) }}
                  <slot :tab="item.name" name="badge" />
                  <el-tooltip
                    v-if="item.helpTip"
                    :show-after="500"
                    effect="dark"
                    placement="bottom"
                    popper-class="help-tips"
                  >
                    <template #content>
                      <div v-sanitize="item.helpTip" class="page-help-content" />
                    </template>
                    <span>
                      <el-button class="help-msg-btn">
                        <el-icon><InfoFilled /></el-icon>
                      </el-button>
                    </span>
                  </el-tooltip>
                </div>
              </template>
            </el-tab-pane>
          </template>
        </el-tabs>

        <div v-if="$slots.headingRightSide" class="tab-page-submenu-right">
          <slot name="headingRightSide" />
        </div>
      </div>

      <div class="tab-page-content">
        <el-alert
          v-if="iHelpMessage && helpAlertVisible"
          class="tab-page-alert"
          :closable="true"
          type="info"
          @close="helpAlertVisible = false"
        >
          <span v-sanitize="iHelpMessage" class="announcement-main" />
        </el-alert>
        <template v-if="!loading">
          <slot>
            <keep-alive v-if="computeActiveComponent">
              <component :is="computeActiveComponent" />
            </keep-alive>
          </slot>
        </template>
      </div>
    </div>
  </Page>
</template>

<script>
import Icon from '@/components/Widgets/Icon'
import { TAB_NAVIGATION_CONTEXT, TAB_NAVIGATION_SCOPE } from '@/components/Drawer/context'
import { toSentenceCase } from '@/utils/common/index'
import { resolveAsyncComponentCompat } from '@/utils/vue'
import { scopedLocalStorage as localStorage } from '@/utils/storage'
import Page from '../Page/'

export default {
  name: 'TabPage',
  components: {
    Page,
    Icon
  },
  inject: {
    tabNavigationContext: {
      from: TAB_NAVIGATION_CONTEXT,
      default: () => ({ scope: TAB_NAVIGATION_SCOPE.ROUTE })
    }
  },
  props: {
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      required: true
    },
    helpMessage: {
      type: String,
      default: ''
    },
    // 兼容调用方用 :help-tip 传入提示。若不在此声明，help-tip 会经 $attrs 透传到内层 Page，
    // 被渲染成 .page-alert（位于 page-heading 与 page-submenu 之间），导致提示与其它页面不一致。
    // 这里显式接收，统一渲染到 tab-page-content 内的 tab-page-alert。
    helpTip: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    navigationScope: {
      type: String,
      default: 'auto',
      validator: (value) => ['auto', ...Object.values(TAB_NAVIGATION_SCOPE)].includes(value)
    },
    rememberActiveTab: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:activeMenu', 'tab-click'],
  data() {
    return {
      loading: false,
      helpAlertVisible: true,
      toSentenceCase: toSentenceCase,
      activeTab: this.activeMenu
    }
  },
  computed: {
    iHelpMessage() {
      return this.helpMessage || this.helpTip
    },
    effectiveNavigationScope() {
      if (this.navigationScope !== 'auto') {
        return this.navigationScope
      }
      return this.tabNavigationContext.scope
    },
    shouldSyncTabState() {
      return this.effectiveNavigationScope === TAB_NAVIGATION_SCOPE.ROUTE
    },
    activeTabStorageKey() {
      const routeKey =
        this.$route.name || this.$route.meta?.fullPath || this.$route.path || 'default'
      return `activeTab:${routeKey}`
    },
    iActiveMenu: {
      get() {
        return this.activeTab
      },
      set(item) {
        this.activeTab = item
        this.$emit('update:activeMenu', item)
      }
    },
    tabIndices() {
      const map = []
      this.submenu.forEach((v) => {
        const hidden = typeof v.hidden === 'function' ? v.hidden() : v.hidden
        if (!hidden) {
          map.push(v)
        }
      })
      return map
    },
    computeActiveComponent() {
      let needActiveComponent = ''
      for (const i of this.submenu) {
        if (i.component && i.name === this.iActiveMenu) {
          needActiveComponent = this.resolveComponent(i.component)
          break
        }
      }
      return needActiveComponent
    }
  },
  watch: {
    activeMenu: {
      handler(newValue) {
        this.activeTab = newValue
      }
    },
    '$route.query.tab'() {
      if (!this.shouldSyncTabState) {
        return
      }
      this.syncActiveTab()
    },
    activeTabStorageKey() {
      this.syncActiveTab()
    },
    iActiveMenu(newValue) {
      if (!newValue) {
        return
      }
      if (!this.shouldSyncTabState) {
        return
      }
      if (this.rememberActiveTab) {
        localStorage.setItem(this.activeTabStorageKey, newValue)
      }
      if (this.$route.query?.tab === newValue) {
        return
      }
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          tab: newValue
        },
        hash: this.$route.hash
      })
    },
    iHelpMessage() {
      this.helpAlertVisible = true
    }
  },
  created() {
    this.syncActiveTab()
    this.loading = false
  },
  methods: {
    handleTabClick(tab) {
      // Element Plus exposes the pane name as `paneName`. Keep `name` in the
      // forwarded event for existing consumers, but let el-tabs' v-model be
      // the single source of truth for the active tab. Reassigning from the
      // obsolete `tab.name` clears the active component on repeated clicks.
      const name = tab.paneName ?? tab.name ?? tab.props?.name
      this.$emit('tab-click', tab.name === name ? tab : { ...tab, name })
    },
    resolveComponent(component) {
      return resolveAsyncComponentCompat(component)
    },
    getPropActiveTab() {
      let activeTab = ''

      const preActiveTabs = this.shouldSyncTabState
        ? [
            this.$route.query['tab'],
            this.rememberActiveTab ? localStorage.getItem(this.activeTabStorageKey) : undefined,
            this.activeMenu
          ]
        : [this.activeMenu]

      for (const preTab of preActiveTabs) {
        const currentTab = typeof preTab === 'object' ? preTab?.name || '' : preTab
        for (const tabName of this.tabIndices) {
          const currentTabName = tabName?.name || ''
          if (currentTab?.toLowerCase() === currentTabName?.toLowerCase()) {
            return currentTabName
          }
        }
      }

      activeTab = this.tabIndices[0]?.name || ''
      return activeTab
    },
    syncActiveTab() {
      const activeTab = this.getPropActiveTab()
      if (!activeTab) {
        return
      }
      this.activeTab = activeTab
      if (this.activeMenu !== activeTab) {
        this.$emit('update:activeMenu', activeTab)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-submenu {
  --el-tabs-header-height: var(--tab-page-header-height, 34px);
  --tab-page-navigation-background-color: var(--page-background-color, #fff);

  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  background-color: var(--tab-page-navigation-background-color);
}

.page-submenu :deep(.el-tabs__header) {
  display: flex;
  align-items: stretch;
  height: var(--tab-page-header-height, 34px);
  min-height: var(--tab-page-header-height, 34px);
  margin: 0;
  padding: 0 var(--tab-page-inline-padding, var(--page-inline-padding, 20px));
  box-sizing: border-box;
  background-color: var(--tab-page-navigation-background-color);
  border: 0;
}

.page-submenu :deep(.el-tabs__nav-wrap),
.page-submenu :deep(.el-tabs__nav-scroll),
.page-submenu :deep(.el-tabs__nav) {
  display: flex;
  align-items: stretch;
  background-color: var(--tab-page-navigation-background-color);
}

.page-submenu :deep(.el-tabs__nav-wrap.is-top) {
  position: relative;
  flex: 1 1 auto;
  margin: 0;
  border: 0;

  &::after {
    display: none;
  }
}

.page-submenu :deep(.el-tabs__header .el-tabs__nav) {
  position: relative;
  z-index: 2;
  gap: 0;
  border: 0;
  border-radius: 0;
}

.page-submenu :deep(.el-tabs__active-bar) {
  z-index: 3;
  bottom: 1px;
  display: block;
  height: 2px;
  background-color: transparent;
  transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: -6px;
    bottom: 0;
    left: -6px;
    background-color: var(--el-color-primary);
    border-radius: 3px;
  }
}

.page-submenu :deep(.el-tabs__header .el-tabs__item),
.page-submenu :deep(.el-tabs__header .el-tabs__item.is-top) {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: var(--tab-page-header-height, 34px);
  margin-top: 0;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
  background-color: var(--tab-page-navigation-background-color);
  border: 0;
  border-radius: 0;
  user-select: none;
  transition:
    color 120ms ease,
    background-color 120ms ease;

  &.is-active {
    z-index: 2;
    color: var(--el-text-color-primary, #303133);
    background-color: var(--tab-page-navigation-background-color);
    border: 0;
    border-radius: 4px 4px 0 0;
    box-shadow: none;

    .pre-icon {
      color: var(--el-text-color-primary, #303133);
      opacity: 1;
    }
  }

  &.is-active:focus,
  &.is-active:focus:active,
  &.is-active:focus-visible {
    outline: none;
    border: 0;
    box-shadow: none;
  }

  &:not(.is-active, .is-disabled):hover {
    color: var(--el-text-color-primary, #303133);
    background-color: var(--tab-page-navigation-background-color);
    cursor: pointer;
  }

  .pre-icon {
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 14px;
    font-size: 14px;
    line-height: 1;
    vertical-align: middle;
    opacity: 0.62;

    > .fa,
    > .el-icon,
    > .svg-icon,
    > svg {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      line-height: 1;
      vertical-align: middle;
    }
  }

  &.is-disabled {
    cursor: not-allowed;

    &:hover {
      color: #c0c4cc;
    }
  }
}

.page-submenu :deep(.el-tabs__header .el-tabs__item + .el-tabs__item) {
  margin-left: 0;
}

.page-submenu :deep(.el-tabs__nav > .el-tabs__active-bar + .el-tabs__item) {
  padding-left: var(--page-heading-icon-inset, 6px);
}

.page-submenu :deep(.tab-page-submenu-item-wrapper) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0;
  line-height: 1;
}

.page-submenu :deep(.el-tabs__item .el-tooltip__trigger),
.page-submenu :deep(.el-tabs__item .help-msg-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  min-height: 13px;
  padding: 0;
  border: none;
  background: transparent !important;
  box-shadow: none;
}

.page-submenu :deep(.el-tabs__item .help-msg-btn .el-icon),
.page-submenu :deep(.el-tabs__item .help-msg-btn .el-icon svg),
.page-submenu :deep(.el-tabs__item .el-tooltip__trigger .el-icon),
.page-submenu :deep(.el-tabs__item .el-tooltip__trigger .el-icon svg) {
  width: 13px;
  height: 13px;
  font-size: 13px;
  color: var(--color-info);
}

.page-submenu :deep(.el-tabs__header) {
  .el-tabs__nav-next,
  .el-tabs__nav-prev {
    top: 0;
    height: var(--tab-page-header-height, 34px);
    line-height: var(--tab-page-header-height, 34px);
    background-color: var(--tab-page-navigation-background-color);
  }

  .el-tabs__nav-next {
    right: 10px;
  }

  .el-tabs__nav-prev {
    left: 10px;
  }
}

.tab-page {
  --tab-page-header-height: 40px;

  &.has-tab-navigation > :deep(.page-head .page-heading) {
    height: 44px;
    border-bottom: 0;
  }

  .tab-page-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;

    &.has-tab-navigation > .tab-page-content {
      padding-top: 16px;
    }

    &.has-tab-navigation > .tab-page-submenu {
      position: relative;
      border-bottom: 0;

      &::after {
        content: '';
        position: absolute;
        z-index: 3;
        right: 0;
        bottom: 0;
        left: 0;
        height: 1px;
        background-color: var(--panel-border-color, var(--el-border-color));
        pointer-events: none;
      }
    }
  }

  .tab-page-submenu {
    display: flex;
    align-items: stretch;
    min-height: var(--tab-page-header-height, 34px);
    box-sizing: border-box;
    background-color: var(--page-background-color, #fff);
    border-bottom: 0;
    overflow: visible;
  }

  .tab-page-submenu .page-submenu {
    flex: 1 1 auto;
    min-width: 0;
  }

  .tab-page-submenu-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: 12px;
    padding-right: var(--page-inline-padding, 20px);
    flex-shrink: 0;
  }

  .tab-page-submenu-right :deep(.el-button) {
    padding: 5px 8px;
  }

  > :deep(.page-content) {
    overflow-y: hidden !important;
    padding: var(--page-content-top-padding, 12px) 0 0;
    scrollbar-gutter: auto;
    background-color: var(--page-content-background-color, #f3f3f4);
  }

  &.has-tab-navigation > :deep(.page-content) {
    padding-top: 0;
    background-color: var(--page-content-background-color, #f3f3f4);
  }

  .tab-page-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: var(--page-section-gap, 8px);
    min-height: 0;
    min-width: 0;
    padding: 10px var(--page-inline-padding, 20px) 0;
    overflow: auto;
    scrollbar-gutter: auto;
    background-color: var(--page-content-background-color, #f3f3f4);

    // 子页跟随可用宽度收缩；表格等需要最小列宽的组件自己承担横向滚动。
    > :deep(*) {
      flex-shrink: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    /*
     * flex 列 + overflow-y:auto 的容器会裁掉自身 padding-bottom（Chrome 已知行为），
     * 导致滚到底时最后一块内容贴边。用一个不参与裁剪的 ::after 占位块补回底部间距。
     */
    &::after {
      content: '';
      display: block;
      flex: 0 0 22px;
      height: 22px;
    }
  }

  /*
   * .tab-page-content 是唯一的滚动容器：小屏空间不足时，应由它整体滚动，而不是让内部 card
   * 自己出现滚动条。故强制卡片相关容器不自带滚动 / 高度上限，把溢出交还给 .tab-page-content。
   */
  .tab-page-content :deep(.el-card__body),
  .tab-page-content :deep(.ibox),
  .tab-page-content :deep(.el-card) {
    overflow: visible !important;
    max-height: none !important;
  }

  // 设置页表单标签在固定 label 列内统一左对齐，避免窄宽度下贴到控件右侧。
  .tab-page-content :deep(.form-fields .el-form-item__label-wrap) {
    display: flex;
    justify-content: flex-start;
  }

  .tab-page-content :deep(.form-fields .el-form-item__label) {
    justify-content: flex-start;
    text-align: left;
  }

  /*
   * <keep-alive> 要求单一根节点，内容组件因此普遍用一个
   * <div>（无 class 或 class=""）包裹多个区块（如 el-alert + IBox）。该 wrapper 会成为唯一的
   * flex 子节点，使外层 gap 对其内部区块失效。这里让纯结构 wrapper 自身成为 flex 列并复用同样的
   * gap，恢复区块间距。
   * 带 class 的 wrapper（如 .auth-container）class 以自身类名开头，均不命中，保持不变。
   */
  .tab-page-content > :deep(div:not([class])),
  .tab-page-content > :deep(div[class='']) {
    display: flex;
    flex-direction: column;
    gap: var(--page-section-gap, 8px);
  }

  .tab-page-content :deep(.tab-page-alert) {
    margin: 0;
  }

  .tab-page-content :deep(.tab-page-alert .el-alert__icon) {
    font-size: 16px;
  }

  .tab-page-content :deep(.tab-page-alert .el-alert__icon .el-icon),
  .tab-page-content :deep(.tab-page-alert .el-alert__icon .el-icon svg) {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  .tab-page-content :deep(.tab-page-alert .el-alert__title),
  .tab-page-content :deep(.tab-page-alert .el-alert__description),
  .tab-page-content :deep(.tab-page-alert .el-alert__content),
  .tab-page-content :deep(.tab-page-alert .announcement-main) {
    font-size: 12px !important;
    line-height: 1.5;
  }

  .tab-page-content :deep(.tab-page-alert .el-alert__closebtn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
}

.page-submenu :deep(.el-tabs__nav-wrap) {
  position: static;
}

.fa {
  margin-right: 2px;
}
</style>
