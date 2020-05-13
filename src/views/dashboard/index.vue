<template>
  <Page>
    <SummaryCards :items="summaryCardList" />
    <el-row>
      <el-col :span="4">
        <RecordCard title="一周Top5登录用户" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4">
        <IBox title="一周Top5登录用户">
          <el-row>-------------------</el-row>
          <el-row v-for="(item, index) in top5LoginUser" :key="item.user">
            <span class="label label-success">{{ index }}</span>
            <span>{{ item.user }}</span>
            <span class="pull-right">{{ item.total }} {{ unitTimesPerWeek }}</span>
          </el-row>
        </IBox>
      </el-col>
      <el-col :span="12">月数据总览</el-col>
      <el-col :span="6">活跃资产比</el-col>
    </el-row>
    <el-row>
      <el-col :span="8">Top10资产</el-col>
      <el-col :span="8">Top10登录</el-col>
      <el-col :span="8">Top10用户</el-col>
    </el-row>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import { IBox, RecordCard } from '@/components'
import SummaryCards from './SummaryCards/index'

export default {
  name: 'Dashboard',
  components: {
    Page, SummaryCards, IBox, RecordCard
  },
  data() {
    return {
      unitTimesPerWeek: this.$t('dashboard.timesPerWeek'),
      top5LoginUser: [
        { 'user': 'Admin', 'total': 12 },
        { 'user': 'Admin0', 'total': 12 }
      ],
      summaryCardList: [
        {
          title: this.$t('dashboard.totalUser'),
          label: { 'type': 'success', 'title': 'Users' },
          totalCount: {
            url: '/api/v1/index/?total_count_users=1',
            key: 'total_count_users',
            describe: 'All users',
            redirect: '/users/users/'
          }
        },
        {
          title: this.$t('dashboard.totalAsset'),
          label: { 'type': 'primary', 'title': 'Assets' },
          totalCount: {
            url: '/api/v1/index/?total_count_assets=1',
            key: 'total_count_assets',
            describe: 'All assets',
            redirect: '/assets/assets/'
          }
        },
        {
          title: this.$t('dashboard.onlineUser'),
          label: { 'type': 'info', 'title': 'Online' },
          totalCount: {
            url: '/api/v1/index/?total_count_online_users=1',
            key: 'total_count_online_users',
            describe: 'Online users',
            redirect: '/terminal/session-online/'
          }
        },
        {
          title: this.$t('dashboard.onlineSession'),
          label: { 'type': 'danger', 'title': 'Connected' },
          totalCount: {
            url: '/api/v1/index/?total_count_online_sessions=1',
            key: 'total_count_online_sessions',
            describe: 'Online sessions',
            redirect: '/terminal/session-online/'
          }
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .label-success {
    background-color: #1c84c6;
    color: #FFFFFF;
  }

  .label {
    margin-right: 10px;
    font-weight: 600;
    padding: 3px 8px;
    font-size: 75%;
    border-radius: .25em;
  }
</style>
