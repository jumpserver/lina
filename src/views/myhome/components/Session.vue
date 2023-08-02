<template>
  <HomeCard :table-config="tableConfig" v-bind="cardConfig" />
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
          'id', 'user', 'asset', 'account', 'remote_addr', 'protocol'
        ],
        columnsMeta: {
          id: {
            prop: 'id',
            label: this.$t('sessions.id'),
            align: 'center',
            width: '70px',
            formatter: function(row, column, cellValue, index) {
              const label = index + 1
              const route = { to: { name: 'SessionDetail', params: { id: row.id }}}
              if (vm.$hasPerm('terminal.view_session')) {
                return <router-link {...{ attrs: route }} >{label}</router-link>
              } else {
                return label
              }
            }
          },
          asset: {
            label: this.$t('sessions.target')
          },
          command_amount: {
            label: this.$t('sessions.command')
          },
          remote_addr: {
            label: this.$t('sessions.remoteAddr')
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            el: {
              disabled: false
            },
            sortable: false
          },
          actions: {
            width: '150px',
            align: 'center',
            formatterArgs: {
              hasDelete: false,
              hasClone: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'connect',
                  fa: 'fa-terminal',
                  type: 'primary',
                  can: ({ row }) => row.is_active,
                  callback: ({ row }) => {
                    window.open(`/luna/?login_to=${row.asset_id}&login_account=${row.account_id}`, '_blank')
                  }
                }
              ]
            }
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
