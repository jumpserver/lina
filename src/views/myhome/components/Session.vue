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
    const vm = this
    return {
      cardConfig: {
        title: this.$t('route.RecentSession')
      },
      tableConfig: {
        url: '/api/v1/terminal/my-sessions/?limit=5',
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
              if (vm.$hasPerm('terminal.view_session')) {
                return <router-link {...{ attrs: route }} >{ label }</router-link>
              } else {
                return label
              }
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
            label: this.$t('acl.system_user'),
            showOverflowTooltip: true
          },
          remote_addr: {
            label: this.$t('sessions.remoteAddr'),
            width: '140px'
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            el: {
              disabled: false
            },
            sortable: false
          }
        },
        hasSelection: false,
        paginationSize: 10
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
