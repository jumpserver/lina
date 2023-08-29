<template>
  <div>
    <el-alert type="success">
      <span v-html="$t('terminal.AppletHostSelectHelpMessage')" />
    </el-alert>
    <ListTable class="applet-host" v-bind="$data" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import { openTaskPage } from '@/utils/jms'
import { ProtocolsFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AppletHost',
  components: {
    ListTable
  },
  data() {
    const vm = this
    const onAction = (row, action) => {
      let routeAction = action
      if (action === 'Clone') {
        routeAction = 'Create'
      }
      const routeName = 'AppletHost' + routeAction
      const route = {
        name: routeName,
        params: {},
        query: {}
      }
      if (action === 'Clone') {
        route.query.clone_from = row.id
      } else if (action === 'Update') {
        route.params.id = row.id
        route.query.platform = row.platform.id
      }
      vm.$router.push(route)
    }
    return {
      tableConfig: {
        url: '/api/v1/terminal/applet-hosts/',
        columnsExclude: ['info'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'address', 'protocols', 'load',
            'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'AppletHostDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          load: {
            formatterArgs: {
              classChoices: {
                '': 'success',
                offline: 'fa fa-chain-broken text-danger',
                critical: 'fa fa-bolt text-warning',
                high: 'fa fa-exclamation-triangle text-info',
                normal: 'fa fa-check text-primary'
              }
            }
          },
          protocols: {
            label: this.$t('assets.Protocols'),
            formatter: ProtocolsFormatter
          },
          actions: {
            formatterArgs: {
              onUpdate: ({ row }) => onAction(row, 'Update'),
              onClone: ({ row }) => onAction(row, 'Clone'),
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/terminal/applet-hosts/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'Test',
                  title: this.$t('common.Test'),
                  can: this.$hasPerm('assets.test_assetconnectivity'),
                  callback: ({ row }) => {
                    this.$axios.post(
                      `/api/v1/assets/assets/${row.id}/tasks/`,
                      { action: 'refresh' },
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        createRoute: 'AppletHostCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.applet-host > > > .protocol {
  margin-left: 3px;
}

</style>
