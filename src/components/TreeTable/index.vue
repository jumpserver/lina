<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <el-collapse-transition>
      <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
        <div v-show="ShowTree" :style="ShowTree?('width:250px;'):('width:0;')" class="transition-box">
          <AutoDataZTree :setting="treeSetting" @urlChange="handleUrlChange" />
        </div>
        <div :style="ShowTree?('display: flex;width: calc(100% - 250px);'):('display: flex;width:100%;')">
          <div class="mini">
            <div style="display:block" class="mini-button" @click="ShowTree=!ShowTree">
              <i v-show="ShowTree" class="fa fa-angle-left fa-x" /><i v-show="!ShowTree" class="fa fa-angle-right fa-x" />
            </div>
          </div>
          <div class="transition-box" style="width: calc(100% - 17px);">
            <TreeListTable :table-config="internalTableConfig" :header-actions="headerActions" />
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
// import TreeNode from '../TreeNode'
// import ZTree from '../ZTree'
import AutoDataZTree from '../AutoDataZTree'
import TreeListTable from './components/TreeListTable'
export default {
  name: 'TreeTable',
  components: {
    Page,
    TreeListTable,
    AutoDataZTree
  },
  props: {
    ...TreeListTable.props,
    helpMessage: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      ShowTree: true,
      internalTableConfig: this.tableConfig
    }
  },
  computed: {
    treeSetting() {
      return this.tableConfig.treeSetting
    }
  },
  methods: {
    handleUrlChange(_url) {
      this.$set(this.internalTableConfig, 'url', _url)
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
  }
  .el-tree{
    background-color: inherit !important;
  }
  .mini{
    margin-right: 5px;
    width: 12px !important;
  }
</style>
