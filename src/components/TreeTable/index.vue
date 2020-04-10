<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <el-collapse-transition>
      <el-row>
        <el-col v-show="ShowTree" :span="4" class="transition-box">
          <TreeNode :url="tableConfig.treeurl" @urlChanged="handleUrlChange" />
        </el-col>
        <el-col :span="1" class="mini"><div style="display:block" class="mini-button" @click="ShowTree=!ShowTree"><i v-show="ShowTree" id="toggle-icon" class="fa fa-angle-left fa-x" /><i v-show="!ShowTree" id="toggle-icon" class="fa fa-angle-right fa-x" /></div></el-col>
        <el-col :span="ShowTree?19:23" class="transition-box">
          <ListTable :table-config="tableConfig" :header-actions="headerActions" />
        </el-col>
      </el-row>
    </el-collapse-transition>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import TreeNode from '../TreeNode'
import ListTable from '@/components/ListTable'
export default {
  name: 'GenericListPage',
  components: {
    Page,
    ListTable,
    TreeNode
  },
  props: {
    ...ListTable.props,
    helpMessage: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      ShowTree: true
    }
  },
  methods: {
    handleUrlChange(_url) {
      // TODO 解决URL跳转的问题
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
