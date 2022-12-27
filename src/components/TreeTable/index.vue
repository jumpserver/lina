<template>
  <el-collapse-transition>
    <div
      class="tree-table-content"
      style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;"
    >
      <div v-show="iShowTree" :style="iShowTree?('width:20%;'):('width:0;')" class="left">
        <component
          :is="component"
          ref="AutoDataZTree"
          :key="componentTreeKey"
          :setting="treeSetting"
          class="auto-data-ztree"
          v-bind="treeTabConfig"
          v-on="$listeners"
          @urlChange="handleUrlChange"
        >
          <div slot="rMenu" slot-scope="{data}">
            <slot name="rMenu" :data="data" />
          </div>
        </component>
      </div>
      <div
        class="right"
        :style="iShowTree?('display: flex;width: calc(100% - 20%);'):('display: flex;width:100%;')"
      >
        <div v-if="showTree" class="mini">
          <div class="mini-button" :class="{'is-show': iShowTree}" @click="iShowTree = !iShowTree">
            <svg-icon
              :icon-class="'double-left'"
              class="icon"
              :style="{'transform': iShowTree ? 'none' : 'rotate(180deg)'}"
            />
          </div>
        </div>
        <div class="transition-box" style="width: calc(100% - 17px);">
          <slot name="table">
            <ListTable
              ref="ListTable"
              :key="componentKey"
              :table-config="iTableConfig"
              :header-actions="headerActions"
              v-on="$listeners"
            >
              <template v-slot:left>
                Hello world
              </template>
            </ListTable>
          </slot>
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import AutoDataZTree from '../AutoDataZTree'
import TabTree from '../TabTree'
import Dialog from '@/components/Dialog'
import ListTable from '../ListTable'
import IBox from '../IBox'
import { setUrlParam } from '@/utils/common'

export default {
  name: 'TreeTable',
  components: {
    ListTable,
    AutoDataZTree,
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
    width: 12px;
    float: right;
    text-align: center;
    padding: 5px 0;
    background-color: #FFFFFF;
    border-color: #FFFFFF;
    border-radius: 3px;
    line-height: 21px;
    cursor: pointer;
    height: 30px;

    &:hover {
      display: block;
    }

    .icon {
      font-size: 14px;
    }
  }

  .el-tree {
    background-color: inherit !important;
  }

  .mini {
    position: relative;
    margin-right: 5px;
    width: 12px !important;
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
