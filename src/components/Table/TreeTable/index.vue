<template>
  <el-collapse-transition>
    <div
      class="tree-table-content"
      style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;"
    >
      <div v-show="iShowTree" :style="iShowTree?('width:20%;'):('width:0;')" class="left">
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
        :style="iShowTree?('display: flex;width: calc(100% - 20%);'):('display: flex;width:100%;')"
        class="right"
      >
        <div v-if="showTree" class="mini">
          <div :class="{'is-show': iShowTree}" class="mini-button" @click="iShowTree = !iShowTree">
            <svg-icon
              :icon-class="'double-left'"
              :style="{'transform': iShowTree ? 'none' : 'rotate(180deg)'}"
              class="icon-left"
            />
          </div>
        </div>
        <div class="transition-box" style="width: calc(100% - 7px);">
          <slot name="table">
            <ListTable
              :key="componentKey"
              ref="ListTable"
              :header-actions="headerActions"
              :table-config="iTableConfig"
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
import { setUrlParam } from '@/utils/common'
import ListTable from '@/components/Table/ListTable/index.vue'
import FileTree from '@/components/Table/TreeTable/components/FileTree.vue'
import IBox from '../../IBox/index.vue'
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
      default: () => '20%'
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
  .is-show {
    display: none;
  }

  .is-rotate {
    display: block;
    transform: rotate(180deg);
  }

  .mini-button {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 13px;
    float: right;
    text-align: center;
    padding: 5px 0;
    border: 1px solid #DCDFE6;
    background-color: #FFFFFF;
    border-radius: 3px;
    cursor: pointer;
    height: 30px;

    &:hover {
      display: block;
      border: 1px solid #d2d2d2;
    }

    .icon-left {
      font-size: 14px;
      margin-left: -1.1px;
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

  .tree-table-content {
    .left {
      background: #f3f3f3;

      &:hover {
        ~ .right .is-show {
          display: block !important;;
        }
      }
    }
  }

  .auto-data-ztree {
    overflow: auto;
    /*border-right: solid 1px red;*/
  }

  .transition-box.left {
    background: #f3f3f3;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    margin-right: 2px;
  }

</style>
