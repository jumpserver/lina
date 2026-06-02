<template>
  <el-collapse-transition>
    <div v-bind="rootAttrs" class="tree-table-content">
      <div
        v-show="iShowTree"
        :class="iShowTree ? '' : 'hidden'"
        :style="{width: treeWidth}"
        class="left"
      >
        <span v-if="component === 'AutoDataZTree'" class="title">
          {{ title }}
        </span>
        <component v-bind="treeTabConfig" :is="component"
          :key="componentTreeKey"
          ref="AutoDataZTree"
          :setting="treeSetting"
          class="auto-data-ztree"
          @url-change="handleUrlChange"
          v-on="forwardedListeners">
          <template #rMenu="{ data }">
            <slot :data="data" name="rMenu" />
          </template>
        </component>
      </div>
      <div
        :style="{'width': iShowTree ? ('calc(100% - ' + treeWidth + ')') : '100%'}"
        class="right"
        style="display: flex"
      >
        <div v-if="true" class="mini">
          <div :class="{'is-show': iShowTree}" class="mini-button" @click="iShowTree = !iShowTree">
            <svg-icon
              :style="{'transform': iShowTree ? 'none' : 'rotate(180deg)'}"
              class="icon-left"
              icon-class="double-left"
            />
          </div>
        </div>
        <div class="transition-box" style="width: calc(100% - 7px);">
          <slot name="table">
            <ListTable
              :key="componentKey"
              ref="ListTable"
              :header-actions="headerActions"
              :quick-filters="quickFilters"
              :quick-summary="quickSummary"
              :table-config="iTableConfig"
              :create-drawer="createDrawer"
              v-on="forwardedListeners"
            />
          </slot>
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import ListTable from '@/components/Table/DrawerListTable/index.vue'
import FileTree from '@/components/Table/TreeTable/components/FileTree.vue'
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'
import { setUrlParam } from '@/utils/common/index'
import { omitVueListeners, pickVueListeners } from '@/utils/vue'
import TabTree from '../TabTree/index.vue'

export default {
  name: 'TreeTable',
  components: {
    ListTable,
    AutoDataZTree,
    FileTree,
    TabTree,
    IBox,
    Dialog
  },
  inheritAttrs: false,
  props: {
    ...ListTable.props,
    treeSetting: {
      type: Object,
      default: () => AutoDataZTree.props.setting.default()
    },
    showTree: {
      type: Boolean,
      default: true
    },
    // 默认引用的Tree组件
    component: {
      type: String,
      default: () => 'AutoDataZTree'
    },
    treeTabConfig: {
      type: Object,
      default: () => ({})
    },
    treeWidth: {
      type: String,
      default: () => '23.6%'
    },
    quickFilters: {
      type: Array,
      default: null
    },
    quickSummary: {
      type: Array,
      default: null
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    title: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String,
      default() {
        return 'AssetTree'
      }
    }
  },
  data() {
    return {
      iTableConfig: this.tableConfig,
      iShowTree: this.showTree,
      componentKey: 0,
      componentTreeKey: 0
    }
  },
  computed: {
    rootAttrs() {
      return omitVueListeners(this.$attrs)
    },
    forwardedListeners() {
      return pickVueListeners(this.$attrs)
    }
  },
  watch: {
    treeConfig: {
      handler(val) {
      },
      deep: true
    },
    showTree(val) {
      this.iShowTree = val
    }
  },
  mounted() {
    // debug(this.treeSetting)
    this.initSetTableUrl()
  },
  methods: {
    initSetTableUrl() {
      const { asset = '', node = '' } = this.$route.query || {}
      let url = this.iTableConfig?.url || ''
      if (url) {
        url = setUrlParam(url, 'asset', asset)
        url = setUrlParam(url, 'node', node)
        this.iTableConfig = {
          ...this.iTableConfig,
          url
        }
      }
    },
    handleUrlChange(url) {
      this.iTableConfig = {
        ...this.iTableConfig,
        url
      }
      this.$emit('urlChange', url)
      this.forceRerender()
    },
    forceRerender() {
      this.componentKey += 1
    },
    forceRerenderTree() {
      this.componentTreeKey += 1
    },
    hideRMenu() {
      this.$refs.AutoDataZTree.hideRMenu()
    },
    getSelectedNodes: function() {
      return this.$refs.AutoDataZTree.getSelectedNodes()
    },
    getNodes: function() {
      return this.$refs.AutoDataZTree.getNodes()
    },
    selectNode: function(node) {
      return this.$refs.AutoDataZTree.selectNode(node)
    },
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-table-content {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 0;

  .left {
    flex-shrink: 0;
    min-height: 0;
    border: 1px solid var(--N200);
    border-radius: var(--radius-card);
    background: var(--surface-panel);
    color: var(--N700);
    overflow: hidden;

    // title 部分
    .title {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 var(--space-4);
      width: 100%;
      border-bottom: 1px solid var(--N200);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      line-height: 40px;

      &:hover {
        cursor: pointer;
        color: var(--color-primary);
      }
    }

    .auto-data-ztree {
      overflow: auto;
      height: 100%;
      padding: var(--space-3);

      &.tree-tab :deep(.page-submenu) {
        min-height: 36px;
      }

      &.tree-tab :deep(.treebox) {
        border: 0;
        border-radius: 0;
        padding: 0;
      }
    }

    // tree 部分
    .data-z-tree {
      height: 100%;

      .treebox {
        padding: 0;
      }
    }

    :deep(.tab-text) {
      font-size: var(--font-size-sm);
    }

    &:hover {
      ~ .right .is-show {
        opacity: 1;
        visibility: visible;
      }
    }
  }

  .right {
    flex: 1 1 auto;
    min-width: 0;
    width: auto !important;
  }
}

.is-show {
  opacity: 0;
  visibility: hidden;
}

.hidden {
  width: 0;
}

.is-rotate {
  display: block;
  transform: rotate(180deg);
}

.mini-button {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-100%, -50%);
  width: 16px;
  padding: var(--space-1) 0;
  border: 1px solid var(--N300);
  background-color: var(--surface-panel);
  border-radius: var(--radius-control);
  cursor: pointer;
  height: 32px;
  color: var(--N600);
  transition: color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-fast) var(--ease-standard);

  &:hover {
    border-color: rgba(26, 179, 148, 0.34);
    background-color: rgba(26, 179, 148, 0.08);
    color: var(--color-primary);
  }

  .icon-left {
    font-size: 11px;
    vertical-align: 0;
  }
}

.mini-button.sweezy-custom-cursor-hover {
  opacity: 1;
  visibility: visible;
}

.el-tree {
  background-color: inherit !important;
}

.mini {
  position: relative;
  margin-right: 0;
  flex: 0 0 16px;
  width: 16px !important;
  min-width: 16px;
}

.transition-box.left {
  background: var(--surface-panel);
  border: 1px solid var(--N200);
  border-radius: var(--radius-card);
}

.transition-box {
  flex: 1 1 auto;
  min-width: 0;
  width: auto !important;
}

</style>
