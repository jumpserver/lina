<template>
  <el-collapse-transition>
    <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
      <div v-show="iShowTree" :style="iShowTree?('width:250px;'):('width:0;')" class="transition-box">
        <component
          :is="component"
          ref="AutoDataZTree"
          :setting="treeSetting"
          class="auto-data-ztree"
          @urlChange="handleUrlChange"
        >
          <div slot="rMenu" slot-scope="{data}">
            <slot name="rMenu" :data="data" />
          </div>
        </component>
      </div>
      <div :style="iShowTree?('display: flex;width: calc(100% - 250px);'):('display: flex;width:100%;')">
        <div class="mini">
          <div style="display:block" class="mini-button" @click="iShowTree=!iShowTree">
            <i v-show="iShowTree" class="fa fa-angle-left fa-x" /><i v-show="!iShowTree" class="fa fa-angle-right fa-x" />
          </div>
        </div>
        <div class="transition-box" style="width: calc(100% - 17px);">
          <ListTable ref="ListTable" :key="componentKey" :table-config="iTableConfig" :header-actions="headerActions" />
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import AutoDataZTree from '../AutoDataZTree'
import ListTable from '../ListTable'
import IBox from '../IBox'
export default {
  name: 'TreeTable',
  components: {
    ListTable,
    AutoDataZTree,
    IBox
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
      componentKey: 0

    }
  },
  watch: {

  },
  methods: {
    handleUrlChange(_url) {
      this.$set(this.iTableConfig, 'url', _url)
      this.forceRerender()
    },
    forceRerender() {
      this.componentKey += 1
    },
    hideRMenu() {
      this.$refs.AutoDataZTree.hideRMenu()
    },
    getSelectedNodes: function() {
      return this.$refs.AutoDataZTree.getSelectedNodes()
    }
  }
}
</script>

<style scoped>
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
</style>
