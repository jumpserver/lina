<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <el-collapse-transition>
      <el-row>
        <el-col v-show="ShowTree" :span="4" class="transition-box">
          <!--          <TreeNode :url="treeurl" @urlChanged="handleUrlChange" />-->
          这里放资产树
        </el-col>
        <el-col :span="1" class="mini"><div style="display:block" class="mini-button" @click="ShowTree=!ShowTree"><i v-show="ShowTree" id="toggle-icon" class="fa fa-angle-left fa-x" /><i v-show="!ShowTree" id="toggle-icon" class="fa fa-angle-right fa-x" /></div></el-col>
        <el-col :span="ShowTree?19:23" class="transition-box">
          这里其它东西
        </el-col>
      </el-row>
    </el-collapse-transition>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
// import TreeNode from '@/components/TreeNode'
export default {
  components: {
    Page
    // TreeNode
  },
  data() {
    return {
      helpMessage: '',
      ShowTree: true,
      treeurl: '/api/v1/assets/nodes/children/tree/'
    }
  },
  methods: {
    handleUrlChange(_url) {
      console.log(_url)
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
