<template>
  <div>
    <ListTable
      :table-config="iTableConfig"
      :header-actions="iHeaderActions"
    />
    <PlatformDialog :visible.sync="showPlatform" :category="category" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import { ActionsFormatter, DetailFormatter, TagsFormatter, ChoicesDisplayFormatter } from '@/components/TableFormatters'
import { connectivityMeta } from '@/components/AccountListTable/const'
import PlatformDialog from '../components/PlatformDialog'

export default {
  components: {
    ListTable,
    PlatformDialog
  },
  props: {
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    category: {
      type: String,
      default: 'all'
    }
  },
  data() {
    const vm = this
    return {
      showPlatform: false,
      defaultConfig: {
        url: '/api/v1/assets/hosts/',
        columns: [
          'name', 'ip', 'public_ip', 'admin_user_display',
          'protocols', 'category', 'type', 'platform', 'sn',
          'is_active', 'connectivity', 'labels_display',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'ip', 'actions'],
          default: [
            'name', 'ip', 'platform', 'category', 'type',
            'connectivity', 'actions'
          ]
        },
        columnsMeta: {
          type: { formatter: ChoicesDisplayFormatter },
          category: { formatter: ChoicesDisplayFormatter },
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            },
            showOverflowTooltip: true,
            sortable: true
          },
          platform: {
            sortable: true
          },
          protocols: {
            formatter: function(row) {
              return <span> {row.protocols.toString()} </span>
            }
          },
          ip: {
            sortable: 'custom',
            width: '140px'
          },
          hardware_info: {
            showOverflowTooltip: true
          },
          cpu_model: {
            showOverflowTooltip: true
          },
          sn: {
            showOverflowTooltip: true
          },
          comment: {
            showOverflowTooltip: true
          },
          connectivity: connectivityMeta,
          labels_display: {
            formatter: TagsFormatter
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      defaultHeaderActions: {
        createRoute: 'HostCreate',
        onCreate: () => {
          this.showPlatform = true
        },
        extraMoreActions: [
          {
            name: 'DeactiveSelected',
            title: this.$t('assets.DeactiveSelected'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return { pk: v.id, is_active: false }
              })
              this.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'ActiveSelected',
            title: this.$t('assets.ActiveSelected'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return { pk: v.id, is_active: true }
              })
              this.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'actionUpdateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !vm.currentOrgIsRoot &&
                vm.$hasPerm('assets.change_asset')
            },
            callback: ({ selectedRows }) => {
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
              vm.updateSelectedDialogSetting.visible = true
            }
          }
        ]
      }
    }
  },
  computed: {
    iTableConfig() {
      return _.merge(this.defaultConfig, this.tableConfig)
    },
    iHeaderActions() {
      return _.merge(this.defaultHeaderActions, this.headerActions)
    }
  }
}
</script>

<style>

</style>
