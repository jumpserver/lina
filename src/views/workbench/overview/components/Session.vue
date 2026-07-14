<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script lang="jsx">
import { getPreference } from '@/api/settings'
import { openNewWindow } from '@/utils/common/index'
import HomeCard from './HomeCard.vue'
export default {
  name: 'Announcement',
  components: {
    HomeCard
  },
  data() {
    const vm = this
    return {
      preference: {},
      cardConfig: {
        title: this.$t('RecentSession')
      },
      tableConfig: {
        url: '/api/v1/terminal/my-sessions/?limit=5',
        columns: ['id', 'asset', 'account', 'remote_addr', 'protocol'],
        columnsMeta: {
          id: {
            prop: 'id',
            align: 'center',
            width: '50px',
            formatter: function (row, column, cellValue, index) {
              const label = index + 1
              const to = {
                name: 'SessionDetail',
                params: {
                  id: row.id
                }
              }
              if (vm.$hasPerm('terminal.view_session')) {
                return <router-link to={to}>{label}</router-link>
              } else {
                return label
              }
            }
          },
          asset: {
            minWidth: 200,
            label: this.$t('Asset')
          },
          account: {
            minWidth: 100
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
                  type: 'primary',
                  can: ({ row }) => row.is_active,
                  callback: ({ row }) => {
                    if (this.preference?.basic?.connect_default_open_method === 'new') {
                      openNewWindow(
                        `/luna/connect?login_to=${row.asset_id}&login_account=${row.account_id}`
                      )
                    } else {
                      window.open(
                        `/luna/?login_to=${row.asset_id}&login_account=${row.account_id}`,
                        '_blank'
                      )
                    }
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
  },
  mounted() {
    getPreference().then((resp) => {
      this.preference = resp
    })
  }
}
</script>

<style lang="scss" scoped>
// 纯图标操作仍会渲染一个空标题占位，向右微调图标以保持视觉居中
:deep(.table-actions .connect .pre-icon) {
  display: inline-block;
  transform: translateX(2px);
}
</style>
