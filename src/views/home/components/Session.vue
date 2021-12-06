<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'

export default {
  name: 'Announcement',
  components: {
    HomeCard
  },
  data() {
    return {
      cardConfig: {
        title: this.$t('route.SessionOffline'),
        icon: 'fa-rocket'
      },
      tableConfig: {
        url: '/api/v1/terminal/sessions/',
        columns: [
          'index', 'user', 'asset', 'system_user', 'remote_addr', 'protocol'
        ],
        columnsMeta: {
          index: {
            prop: 'index',
            label: this.$t('sessions.id'),
            align: 'center',
            width: '40px',
            formatter: function(row, column, cellValue, index) {
              const label = index + 1
              const route = { to: { name: 'SessionDetail', params: { id: row.id }}}
              return <router-link {...{ attrs: route }}>{ label }</router-link>
            }
          },
          user: {
            showOverflowTooltip: true
          },
          asset: {
            label: this.$t('sessions.target'),
            showOverflowTooltip: true
          },
          command_amount: {
            label: this.$t('sessions.command')
          },
          system_user: {
            showOverflowTooltip: true
          },
          remote_addr: {
            width: '140px'
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            sortable: false,
            formatter: null
          }
        },
        hasSelection: false,
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
