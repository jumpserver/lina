<template>
  <Page v-bind="$attrs" :title="title" class="tab-page">
    <template #headingRightSide>
      <slot name="headingRightSide" />
    </template>

    <div class="tab-page-wrapper">
      <el-tabs
        v-if="tabIndices.length > 1"
        v-model="iActiveMenu"
        class="page-submenu"
        @tab-click="handleTabClick"
      >
        <template v-for="item in tabIndices" :key="item.name">
          <el-tab-pane :disabled="item.disabled" :name="item.name">
            <template #label>
              <Icon v-if="item.icon" :icon="item.icon" class="pre-icon" />
              {{ toSentenceCase(item.title) }}
              <slot :tab="item.name" name="badge" />
              <el-tooltip
                v-if="item.helpTip"
                :open-delay="500"
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
            </template>
          </el-tab-pane>
        </template>
      </el-tabs>

      <div class="tab-page-content">
        <el-alert
          v-if="helpMessage && helpAlertVisible"
          class="tab-page-alert"
          :closable="true"
          type="info"
          @close="helpAlertVisible = false"
        >
          <span v-sanitize="helpMessage" class="announcement-main" />
        </el-alert>
        <transition v-if="!loading" appear mode="out-in" name="fade-transform">
          <slot>
            <keep-alive v-if="computeActiveComponent">
              <component :is="computeActiveComponent" />
            </keep-alive>
          </slot>
        </transition>
      </div>
    </div>
  </Page>
</template>

<script>
import Icon from '@/components/Widgets/Icon'
import { toSentenceCase } from '@/utils/common/index'
import { resolveAsyncComponentCompat } from '@/utils/vue'
import Page from '../Page/'

export default {
  name: 'TabPage',
  components: {
    Page,
    Icon
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
    title: {
      type: String,
      default: ''
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
        this.iActiveMenu = newValue
      }
    },
    helpMessage() {
      this.helpAlertVisible = true
    }
  },
  created() {
    this.iActiveMenu = this.getPropActiveTab()
    this.loading = false
  },
  methods: {
    handleTabClick(tab) {
      this.$emit('tab-click', tab)
      this.iActiveMenu = tab.name
      localStorage.setItem('activeTab', tab.name)
    },
    resolveComponent(component) {
      return resolveAsyncComponentCompat(component)
    },
    getPropActiveTab() {
      let activeTab = ''

      const preActiveTabs = [
        this.$route.query['tab'],
        localStorage.getItem('activeTab'),
        this.activeMenu
      ]

      for (const preTab of preActiveTabs) {
        const currentTab = typeof preTab === 'object' ? preTab?.name || '' : preTab
        for (const tabName of this.tabIndices) {
          const currentTabName = tabName?.name || ''
          if (currentTab?.toLowerCase() === currentTabName?.toLowerCase()) {
            return currentTabName
          }
        }
      }

      activeTab = this.tabIndices[0].name
      return activeTab
    }
  }
}
</script>

<style lang="scss" scoped>
.page.no-title {
  :deep(.page-submenu) {
    .el-tabs__header {
      margin-top: 0;
    }

    .tab-page-content {
      height: calc(100% - 45px);
    }
  }
}

.page-submenu {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
}

.page-submenu :deep(.el-tabs__header) {
  background-color: white;
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 30px;
  display: flex;
  align-items: stretch;
  min-height: 40px;
  border-bottom: 1px solid #ebeef5;
}

.page-submenu :deep(.el-tabs__nav-wrap),
.page-submenu :deep(.el-tabs__nav-scroll),
.page-submenu :deep(.el-tabs__nav) {
  display: flex;
  align-items: stretch;
}

.page-submenu :deep(.el-tabs__nav-wrap) {
  flex: 1 1 auto;
  margin: 0;

  &::after {
    display: none;
  }
}

.page-submenu :deep(.el-tabs__active-bar) {
  height: 2px;
}

.page-submenu :deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  line-height: 40px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);

  .pre-icon {
    width: 16px;
    display: inline-block;
    opacity: 0.6;
  }

  &.is-active {
    .pre-icon {
      opacity: 1;
    }
  }

  &.is-disabled {
    cursor: not-allowed;

    &:hover {
      color: #c0c4cc;
    }
  }
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
  .el-tabs__nav-next {
    right: 10px;
  }

  .el-tabs__nav-prev {
    left: 10px;
  }
}

.tab-page {
  .tab-page-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  :deep(.page-heading) {
    border-bottom: none;
  }

  :deep(.page-content) {
    overflow-y: hidden !important;
    padding: 0;
  }

  .tab-page-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding: 10px 30px 22px;
    overflow-y: auto;
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
