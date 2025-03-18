<template>
  <div>
    <el-alert type="success">
      <span v-sanitize="$t('AppletHostSelectHelpMessage')" />
    </el-alert>
    <DrawerListTable
      ref="table"
      class="applet-host"
      :create-drawer="createDrawer"
      v-bind="$data"
    />
  </div>
</template>

<script>
import { DrawerListTable } from '@/components'
import { openTaskPage } from '@/utils/jms'
import { ProtocolsFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AppletHost',
  components: {
    DrawerListTable
  },
  data() {
    return {
      createDrawer: () => import('./AppletHostCreateUpdate.vue'),
      detailDrawer: () => import('./AppletHostDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/terminal/applet-hosts/',
        columnsExclude: ['info', 'auto_config', 'gathered_info', 'deploy_options'],
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
            formatter: ProtocolsFormatter
          },
          actions: {
            formatterArgs: {
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/terminal/applet-hosts/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'Test',
                  title: this.$t('Test'),
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
        hasImport: false,
        onCreate: () => {
          this.$refs.table.onCreate({ type: 'windows', category: 'host', platform: 'RemoteAppHost' })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.applet-host ::v-deep .protocol {
  margin-left: 3px;
}
</style>
