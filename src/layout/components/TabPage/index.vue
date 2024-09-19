<template>
  <Page v-if="!loading" class="tab-page" v-bind="$attrs">
    <template #headingRightSide>
      <slot name="headingRightSide" />
    </template>

    <div style="height: 100%">
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
            :label-content="item.labelContent"
            :name="item.name"
          >
            <span slot="label">
              <i v-if="item.icon" :class="item.icon" class="fa pre-icon " />
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
        <transition appear mode="out-in" name="fade-transform">
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
import { toSentenceCase } from '@/utils/common'

export default {
  name: 'TabPage',
  components: {
    Page
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
    $route(to, from) {
      // 好像没必要
      // const activeTab = to.query?.tab
      // if (activeTab && this.iActiveMenu !== activeTab) {
      //   this.iActiveMenu = activeTab
      // }
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
      this.$cookie.set(this.$route.path, tab.name, 1)
    },
    getPropActiveTab() {
      let activeTab = ''

      const preActiveTabs = [
        this.$route.query['tab'],
        this.$cookie.get(this.$route.path),
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

.page-submenu ::v-deep .el-tabs__header {
  background-color: white;
  margin-top: -10px;
  padding: 0 30px;
  margin-bottom: 5px;

  .el-tabs__item {
    i.pre-icon {
      opacity: 0.6;
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
  ::v-deep .page-heading {
    border-bottom: none;
  }

  ::v-deep .page-content {
    overflow-y: hidden;
    padding: 0;
  }

  .tab-page-content {
    padding: 10px 30px 22px;
    overflow-y: auto;
    height: calc(100% - 50px);

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
