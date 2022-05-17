<template>
  <el-collapse-transition>
    <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
      <div v-show="iShowTree" :style="iShowTree?('width:20%;'):('width:0;')" class="transition-box left">
        <component
          :is="component"
          ref="AutoDataZTree"
          :key="componentTreeKey"
          :setting="treeSetting"
          class="auto-data-ztree"
          v-on="$listeners"
          @urlChange="handleUrlChange"
        >
          <div slot="rMenu" slot-scope="{data}">
            <slot name="rMenu" :data="data" />
          </div>
        </component>
      </div>
      <div :style="iShowTree?('display: flex;width: calc(100% - 20%);'):('display: flex;width:100%;')">
        <div class="mini">
          <div style="display:block" class="mini-button" @click="iShowTree=!iShowTree">
            <i v-show="iShowTree" class="fa fa-angle-left fa-x" /><i v-show="!iShowTree" class="fa fa-angle-right fa-x" />
          </div>
        </div>
        <div class="transition-box" style="width: calc(100% - 17px);">
          <slot name="table">
            <ListTable ref="ListTable" :key="componentKey" :table-config="iTableConfig" :header-actions="headerActions" v-on="$listeners" />
          </slot>
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import AutoDataZTree from '../AutoDataZTree'
import Dialog from '@/components/Dialog'
import ListTable from '../ListTable'
import IBox from '../IBox'
export default {
  name: 'TreeTable',
  components: {
    ListTable,
    AutoDataZTree,
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
    }
  },
  mounted() {
    // debug(this.treeSetting)
  },
  methods: {
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
  .mini-button{
    width: 12px;
    float: right;
    text-align: center;
    padding: 5px 0;
    background-color: #1ab394;
    border-color: #1ab394;
    color: #FFFFFF;
    border-radius: 3px;
    line-height: 1.428;
    cursor:pointer;
  }
  .el-tree{
    background-color: inherit !important;
  }
  .mini{
    margin-right: 5px;
    width: 12px !important;
  }

  .auto-data-ztree {
    overflow: auto;
    /*border-right: solid 1px red;*/
  }
  .transition-box.left {
    background: #f3f3f3;
  }
</style>
