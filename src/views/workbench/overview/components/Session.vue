<template>
  <HomeCard :table-config="tableConfig" v-bind="cardConfig" />
</template>

<script>
import { createVNode as _createVNode, isVNode as _isVNode, resolveComponent as _resolveComponent } from 'vue'
import HomeCard from './HomeCard.vue'
import { getPreference } from '@/api/settings'
import { openNewWindow } from '@/utils/common/index'
function _isSlot(s) {
  return typeof s === 'function' || Object.prototype.toString.call(s) === '[object Object]' && !_isVNode(s)
}
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
            formatter: function(row, column, cellValue, index) {
              const label = index + 1
              const route = {
                to: {
                  name: 'SessionDetail',
                  params: {
                    id: row.id
                  }
                }
              }
              if (vm.$hasPerm('terminal.view_session')) {
                return _createVNode(_resolveComponent('router-link'), {
                  attrs: route
                }, _isSlot(label) ? label : {
                  default: () => [label]
                })
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
              extraActions: [{
                name: 'connect',
                icon: 'fa-desktop',
                plain: true,
                type: 'primary',
                can: ({
                  row
                }) => row.is_active,
                callback: ({
                  row
                }) => {
                  if (this.preference?.basic?.connect_default_open_method === 'new') {
                    openNewWindow(`/luna/connect?login_to=${row.asset_id}&login_account=${row.account_id}`)
                  } else {
                    window.open(`/luna/?login_to=${row.asset_id}&login_account=${row.account_id}`, '_blank')
                  }
                }
              }]
            }
          }
        },
        hasSelection: false,
        paginationSize: 10
      }
    }
  },
  mounted() {
    getPreference().then(resp => {
      this.preference = resp
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
