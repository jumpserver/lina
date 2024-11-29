<template>
  <HomeCard :table-config="tableConfig" v-bind="cardConfig" />
</template>

<script>
import HomeCard from '@/views/workbench/myhome/components/HomeCard.vue'

export default {
  components: {
    HomeCard
  },
  data() {
    const vm = this
    return {
      cardConfig: {
        title: '改密失败账号'
      },
      tableConfig: {
        url: '/api/v1/terminal/my-sessions/?limit=5',
        columns: [
          'id', 'asset', 'account', 'remote_addr', 'protocol'
        ],
        columnsMeta: {
          id: {
            prop: 'id',
            align: 'center',
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
            'min-width': 200,
            label: this.$t('Asset')
          },
          account: {
            'min-width': 100
          },
          command_amount: {
            align: 'center',
            label: this.$t('Command')
          },
          remote_addr: {
            width: 180,
            label: this.$t('RemoteAddr')
          },
          protocol: {
            width: 100,
            label: this.$t('Protocol'),
            el: {
              disabled: false
            },
            sortable: false
          },
          actions: {
            align: 'center',
            formatterArgs: {
              hasDelete: false,
              hasClone: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'connect',
                  icon: 'fa-desktop',
                  plain: true,
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
