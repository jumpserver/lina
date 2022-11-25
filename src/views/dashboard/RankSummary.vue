<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="24">
        <RankTable v-bind="userConfig" />
      </el-col>
      <el-col :lg="12" :sm="24">
        <RankTable v-bind="assetConfig" />
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
        url: '/api/v1/users/users/',
        note: '登录用户排名',
        columns: ['username'],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          }
        }
      },
      assetConfig: {
        title: '活跃资产排名',
        url: '/api/v1/assets/assets/',
        note: '活跃资产排名',
        columns: ['name'],
        columnsMeta: {}
      }
    }
  },
  methods: {

  }
}
</script>

<style scoped>

</style>
