<template>
  <el-row :gutter="10">
    <el-col v-for="item of summaryItems" :key="item.title" :md="6" :sm="12" :xs="12">
      <SummaryCard :title="item.title" :right-side-label="item.rightSideLabel" :body="item.body" />
    </el-col>
  </el-row>
</template>

<script>
import SummaryCard from '@/components/SummaryCard'
import rolc from '@/utils/role'
import { mapGetters } from 'vuex'

export default {
  name: 'ResourceSummary',
  components: { SummaryCard },
  data() {
    return {
      counter: {
        total_count_assets: '.',
        total_count_users: '.',
        total_count_online_users: '.',
        total_count_online_sessions: '.'
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentOrgRoles'
    ]),
    isOrgAuditor() {
      return rolc.getRolesDisplay(this.currentOrgRoles).includes('OrgAuditor') || rolc.getRolesDisplay(this.currentOrgRoles).includes('Auditor')
    },
    summaryItems() {
      return [
        {
          title: this.$t('dashboard.UsersTotal'),
          rightSideLabel: {
            title: 'Users',
            type: 'success'
          },
          body: {
            route: `/users/users`,
            count: this.counter.total_count_users,
            comment: 'All users',
            noLink: this.isOrgAuditor
          }
        },
        {
          title: this.$t('dashboard.AssetsTotal'),
          rightSideLabel: {
            title: 'Assets',
            type: 'info'
          },
          body: {
            route: `/assets/assets`,
            count: this.counter.total_count_assets,
            comment: 'All assets',
            noLink: this.isOrgAuditor
          }
        },
        {
          title: this.$t('dashboard.OnlineUsers'),
          rightSideLabel: {
            title: 'Online',
            type: 'primary'
          },
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_count_online_users,
            comment: 'Online users'
          }
        },
        {
          title: this.$t('dashboard.OnlineSessions'),
          rightSideLabel: {
            title: 'Connected',
            type: 'danger'
          },
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_count_online_sessions,
            comment: 'Online sessions'
          }
        }
      ]
    }
  },
  async mounted() {
    this.counter = await this.getResourcesCount()
  },
  methods: {
    async getResourcesCount() {
      return this.$axios.get('/api/v1/index/?total_count=1')
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-col {
    margin-bottom: 25px;
  &:last-child {
     margin-bottom: 0;
   }
  }

  @media print {
    .el-col-24{
      width: 50% !important;
    }
  }

</style>
