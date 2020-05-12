<template>
  <Page>
    <el-row :gutter="30">
      <SummaryCard v-for="card of summaryCards" :key="card.title" :card="card" />
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
          title: 'Total users',
          label: {
            'type': 'success',
            'title': 'Users'
          },
          totalCount: {
            count: '1',
            url: '/users/users/',
            describe: 'All users'
          }
        },
        {
          title: 'Total assets',
          label: {
            'type': 'info',
            'title': 'Assets'
          },
          totalCount: {
            count: '333',
            url: '/assets/assets/',
            describe: 'All assets'
          }
        },
        {
          title: 'Online users',
          label: {
            'type': 'primary',
            'title': 'Online'
          },
          totalCount: {
            count: '333',
            url: '/terminal/session-online/',
            describe: 'Online users'
          }
        },
        {
          title: 'Online sessions',
          label: {
            'type': 'danger',
            'title': 'Connected'
          },
          totalCount: {
            count: '333',
            url: '/terminal/session-online/',
            describe: 'Online sessions'
          }
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
