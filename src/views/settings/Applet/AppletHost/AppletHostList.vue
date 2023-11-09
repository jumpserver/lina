<template>
  <div>
    <el-alert type="success">
      <span v-html="$t('terminal.AppletHostSelectHelpMessage')" />
    </el-alert>
    <ListTable class="applet-host" v-bind="$data" />
    <AppletHostCreateUpdate v-if="visible" :action="action" :row="row" :visible.sync="visible" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import { openTaskPage } from '@/utils/jms'
import { ProtocolsFormatter } from '@/components/Table/TableFormatters'
import AppletHostCreateUpdate from './AppletHostCreateUpdate.vue'

export default {
  name: 'AppletHost',
  components: {
    ListTable,
    AppletHostCreateUpdate
  },
  data() {
    const vm = this
    const onAction = (row, action) => {
      vm.action = action.toLowerCase()
      vm.row = row
      vm.platform = row.platform
      setTimeout(() => {
        vm.visible = true
      }, 0)
    }
    return {
      visible: false,
      action: 'create',
      row: {},
      platform: {},
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
        onCreate: () => {
          this.visible = true
          this.platform = {}
        },
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
