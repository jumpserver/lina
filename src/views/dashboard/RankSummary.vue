<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="24">
        <RankTable :config="userConfig" />
      </el-col>
      <el-col :lg="12" :sm="24">
        <RankTable :config="assetConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import RankTable from './components/RankTable.vue'
export default {
  components: {
    RankTable
  },
  data() {
    return {
      userConfig: {
        title: '登录用户排名',
        url: '/api/v1/index/?dates_login_times_top10_users=1',
        tip: '登录用户排名',
        data: 'dates_login_times_top10_users',
        columns: [
          {
            prop: 'user',
            label: '用户名'
          },
          {
            prop: 'total',
            label: '登录次数'
          }
        ]
      },
      assetConfig: {
        title: '活跃资产排名',
        url: '/api/v1/index/?dates_login_times_top10_assets=1',
        tip: '活跃资产排名',
        data: 'dates_login_times_top10_assets',
        columns: [
          {
            prop: 'asset',
            label: '资产名称'
          },
          {
            prop: 'total',
            label: '访问次数'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
