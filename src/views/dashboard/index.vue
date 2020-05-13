<template>
  <Page>
    <el-row :gutter="30">
      <SummaryCard v-for="card in summaryCards" :key="card.title" :title="card.title" :label="card.label" :total-count="card.totalCount" />
    </el-row>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import { SummaryCard } from '@/components'

export default {
  name: 'Dashboard',
  components: {
    Page, SummaryCard
  },
  props: {
  },
  data() {
    return {
      summaryCards: [
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
</style>
