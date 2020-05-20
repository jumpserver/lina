<template>
  <el-row :gutter="10">
    <el-col v-for="item of summaryItems" :key="item.title" :md="6" :sm="12">
      <SummaryCard :title="item.title" :right-side-label="item.rightSideLabel" :body="item.body" />
    </el-col>
  </el-row>
</template>

<script>
import { SummaryCard } from '@/components'

export default {
  name: 'ResourceSummary',
  components: { SummaryCard },
  data() {
    return {
      summaryItems: [
        {
          title: this.$t('dashboard.UsersTotal'),
          rightSideLabel: {
            title: 'Users',
            type: 'success'
          },
          body: {
            link: '',
            count: 10,
            comment: 'All users'
          }
        },
        {
          title: this.$t('dashboard.AssetsTotal'),
          rightSideLabel: {
            title: 'Assets',
            type: 'info'
          },
          body: {
            link: '',
            count: 10,
            comment: 'All assets'
          }
        },
        {
          title: this.$t('dashboard.OnlineUsers'),
          rightSideLabel: {
            title: 'Online',
            type: 'primary'
          },
          body: {
            link: '',
            count: 10,
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
            link: '',
            count: 10,
            comment: 'Online sessions'
          }
        }
      ]
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

</style>
