<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/audits/login-logs/',
        columns: ['username', 'type', 'ip', 'city', 'user_agent', 'mfa', 'reason', 'status', 'datetime'],
        columnsMeta: [
          {
            prop: 'username',
            label: this.$t('audits.username')
          },
          {
            prop: 'type',
            label: this.$t('audits.type'),
            sortable: true
          },
          {
            prop: 'ip',
            label: this.$t('audits.ip')
          },
          {
            prop: 'city',
            label: this.$t('audits.city')
          },
          {
            prop: 'user_agent',
            label: this.$tc('audits.user_agent')
          },
          {
            prop: 'mfa',
            label: this.$t('audits.mfa')
          },
          {
            prop: 'reason',
            label: this.$t('audits.reason')
          },
          {
            prop: 'status',
            label: this.$t('audits.status')
          },
          {
            prop: 'datetime',
            label: this.$t('audits.datetime')
          }
        ]
      },
      headerActions: {
        createRoute: 'AssetCreate'
      }
    }
  }
}
</script>

<style>

</style>
