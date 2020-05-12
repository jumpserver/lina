<template>
  <Page>
    <el-row :gutter="30">
      <SummaryCard v-for="card of summaryCards" :key="card.title" :card="card" />

      <!--      <SummaryCard :title="title" :label="label" :total-count="totalCount" :describe="describe" />-->
      <!--      <SummaryCard :title="title" :label="label" :total-count="totalCount" :describe="describe" />-->
      <!--      <SummaryCard :title="title" :label="label" :total-count="totalCount" :describe="describe" />-->
      <!--      <SummaryCard :title="title" :label="label" :total-count="totalCount" :describe="describe" />-->
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
          totalCount: '333',
          totalCountUrl: '/users/users/',
          totalCountDescribe: 'All users'
        },
        {
          title: 'Total assets',
          label: {
            'type': 'info',
            'title': 'Assets'
          },
          totalCount: '444',
          totalCountUrl: '/assets/assets/',
          totalCountDescribe: 'All assets'
        },
        {
          title: 'Online users',
          label: {
            'type': 'primary',
            'title': 'Online'
          },
          totalCount: '444',
          totalCountUrl: '/terminal/session-online/',
          totalCountDescribe: 'Online users'
        },
        {
          title: 'Online sessions',
          label: {
            'type': 'danger',
            'title': 'Connected'
          },
          totalCount: '444',
          totalCountUrl: '/terminal/session-online/',
          totalCountDescribe: 'Online sessions'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
