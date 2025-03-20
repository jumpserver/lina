<template>
  <Page :title="title" class="tab-page" v-bind="$attrs">
    <template #headingRightSide>
      <slot name="headingRightSide" />
    </template>

    <div class="tab-page-wrapper">
      <el-tabs
        v-if="tabIndices.length > 1"
        slot="submenu"
        v-model="iActiveMenu"
        class="page-submenu"
        @tab-click="handleTabClick"
      >
        <template v-for="item in tabIndices">
          <el-tab-pane
            :key="item.name"
            :disabled="item.disabled"
            :name="item.name"
          >
            <span slot="label">
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
                <div slot="content" v-sanitize="item.helpTip" class="page-help-content" />
                <span>
                  <el-button class="help-msg-btn">
                    <i class="el-icon-info" />
                  </el-button>
                </span>
              </el-tooltip>
            </span>
          </el-tab-pane>
        </template>
      </el-tabs>

      <div class="tab-page-content">
        <el-alert v-if="helpMessage" type="success">
          <span v-sanitize="helpMessage" class="announcement-main" />
        </el-alert>
        <transition v-if="!loading" appear mode="out-in" name="fade-transform">
          <slot>
            <keep-alive>
              <component :is="computeActiveComponent" />
            </keep-alive>
          </slot>
        </transition>
      </div>
    </div>
  </Page>
</template>

<script>
import Page from '../Page/'
import Icon from '@/components/Widgets/Icon'
import { toSentenceCase } from '@/utils/common'

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
  data() {
    return {
      loading: false,
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
        if (i.component && (i.name === this.iActiveMenu)) {
          needActiveComponent = i.component
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

<style lang='scss' scoped>

.page.no-title {
  ::v-deep {
    .page-submenu .el-tabs__header {
      margin-top: 0;
    }

    .tab-page-content {
      height: calc(100% - 45px);
    }
  }
}

.page-submenu ::v-deep .el-tabs__header {
  background-color: white;
  margin-top: -10px;
  padding: 0 30px;
  margin-bottom: 5px;

  .el-tabs__item {
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
  }

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
  }

  ::v-deep .page-heading {
    border-bottom: none;
  }

  ::v-deep .page-content {
    overflow-y: hidden !important;
    padding: 0;
  }

  .tab-page-content {
    padding: 10px 30px 22px;
    overflow-y: auto;
    height: calc(100% - 33px);

    .el-alert {
      margin-top: 0;
      margin-bottom: 5px;
    }
  }
}

.page-submenu ::v-deep .el-tabs__nav-wrap {
  position: static;
}

.fa {
  margin-right: 2px;
}
</style>
