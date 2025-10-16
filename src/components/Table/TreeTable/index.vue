<template>
  <el-collapse-transition>
    <div class="tree-table-content">
      <div
        v-show="iShowTree"
        :class="iShowTree ? '' : 'hidden'"
        :style="{width: treeWidth}"
        class="left"
      >
        <span v-if="component === 'AutoDataZTree'" class="title">
          {{ title }}
        </span>
        <component
          :is="component"
          :key="componentTreeKey"
          ref="AutoDataZTree"
          :setting="treeSetting"
          class="auto-data-ztree"
          v-bind="treeTabConfig"
          @urlChange="handleUrlChange"
          v-on="$listeners"
        >
          <div slot="rMenu" slot-scope="{data}">
            <slot :data="data" name="rMenu" />
          </div>
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
              v-on="$listeners"
            />
          </slot>
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { setUrlParam } from '@/utils/common/index'
import ListTable from '@/components/Table/DrawerListTable/index.vue'
import FileTree from '@/components/Table/TreeTable/components/FileTree.vue'
import IBox from '@/components/Common/IBox/index.vue'
import TabTree from '../TabTree/index.vue'
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'

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
        return this.$t('AssetTree')
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
        this.$set(this.iTableConfig, 'url', url)
      }
    },
    handleUrlChange(url) {
      this.$set(this.iTableConfig, 'url', url)
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
$origin-color: #ffffff;

.tree-table-content {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;

  .left {
    //height: 100%;
    background: $origin-color;
    color: var(--color-border);

    // title 部分
    .title {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 20px;
      width: 100%;
      border-bottom: solid 2px var(--color-primary);
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);

      &:hover {
        cursor: pointer;
        color: var(--color-primary);
      }
    }

    .auto-data-ztree {
      overflow: auto;
      height: 100%;

      &.tree-tab ::v-deep .page-submenu {
        height: 40px;
      }
    }

    // tree 部分
    .data-z-tree {
      //margin-left: -20px;
      //width: calc(100% + 20px);

      .treebox {
        padding-left: 10px;
        padding-bottom: 10px;
      }
    }

    ::v-deep .tab-text {
      font-size: 13px;
    }

    &:hover {
      ~ .right .is-show {
        display: block !important;;
      }
    }
  }
}

.is-show {
  display: none;
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
  transform: translate(-100%, -50%);
  width: 13px;
  float: right;
  text-align: center;
  padding: 5px 0;
  border: 1px solid #DCDFE6;
  background-color: #f3f3f3;
  border-radius: 2px;
  cursor: pointer;
  height: 30px;

  &:hover {
    display: block;
    border: 1px solid #d2d2d2;
  }

  .icon-left {
    font-size: 11px;
    vertical-align: 0;
  }
}

.el-tree {
  background-color: inherit !important;
}

.mini {
  position: relative;
  margin-right: 5px;
  width: 2px !important;
}

.transition-box.left {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
}

</style>
