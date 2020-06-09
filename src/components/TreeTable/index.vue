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
          @showNodeInfoDialog="showNodeInfoDialog"
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
          <slot name="table">
            <ListTable ref="ListTable" :key="componentKey" :table-config="iTableConfig" :header-actions="headerActions" />
          </slot>
        </div>
      </div>
      <Dialog width="30%" :title="this.$t('assets.NodeInformation')" :visible.sync="nodeInfoDialog.show" :show-cancel="false" :show-confirm="false">
        <el-row v-for="item in nodeInfoDialog.items" :key="'card-' + item.key" :gutter="10" class="item">
          <el-col :span="6"><div class="item-label"><label>{{ item.label }}: </label></div></el-col>
          <el-col :span="18"><div class="item-text">{{ item.value }}</div></el-col>
        </el-row>
      </Dialog>
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
      nodeInfoDialog: {
        show: false,
        items: []
      }
    }
  },
  watch: {
  },
  methods: {
    handleUrlChange(_url) {
      this.$set(this.iTableConfig, 'url', _url)
      this.$emit('urlChange', _url)
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
    },
    showNodeInfoDialog(node) {
      this.nodeInfoDialog.show = true
      this.nodeInfoDialog.items = [
        { key: 'id', label: 'ID', value: node.id },
        { key: 'name', label: this.$t('assets.Name'), value: node.name },
        { key: 'fullName', label: this.$t('assets.FullName'), value: node.full_value },
        { key: 'key', label: this.$t('assets.Key'), value: node.key }
      ]
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

  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
     }
  }
</style>
