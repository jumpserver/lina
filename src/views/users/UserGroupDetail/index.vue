<template>
  <div class="detail">
    <div class="header">
      <div class="title">ins-goc12paf（研发团队测试环境，谁删了我跟他拼命）</div>
    </div>
    <div class="tabs">
      <el-tabs v-model="activeName" >
        <el-tab-pane label="用户管理" name="first">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>卡片名称</span>
              <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
            </div>
            <div v-for="o in 4" :key="o" class="text item">
              {{'列表内容 ' + o }}
            </div>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
        <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
        <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { getUserGroup } from '@/api/user'

export default {
  data() {
    return {
      activeName: 'first'
    }
  },
  mounted() {
    this.getGroupDetail()
  },
  methods: {
    getGroupDetail() {
      getUserGroup(this.$route.params.id).then(response => {
        this.data = response
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  .detail {
    /*background-color: white;*/
    margin-right: -20px;
    margin-left: -20px;
    margin-top: -8px;
  }

  .tabs >>> .el-tabs__header {
    padding: 0 0 0 20px;
    background-color: white;
  }

  .header {
    padding: 10px 20px;
    background-color: white;
  }

  .tabs > > > .el-tabs__nav div.el-tabs__item {
    /*margin-left: 10px;*/
  }

  .tabs > > > .el-tab-pane {
    margin-left: 20px;
    margin-right: 20px;
  }
</style>
