<template>
  <div>
    <ListTable :table-config="iTableConfig" :header-actions="iHeaderActions" />
    <PlatformDialog :visible.sync="showPlatform" :category="category" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import {
  ActionsFormatter,
  DetailFormatter,
  TagsFormatter,
  ChoicesDisplayFormatter
} from '@/components/TableFormatters'
import { connectivityMeta } from '@/components/AccountListTable/const'
import PlatformDialog from '../components/PlatformDialog'

export default {
  components: {
    ListTable,
    PlatformDialog
  },
  props: {
    url: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'all'
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    addColumns: {
      type: Array,
      default: () => []
    },
    addColumnsMeta: {
      type: Object,
      default: () => ({})
    },
    addExtraMoreActions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const vm = this
    return {
      showPlatform: false,
      defaultConfig: {
        url: '/api/v1/assets/hosts/',
        columns: [
          'name', 'ip', 'category', 'type', 'platform',
          'protocols', 'is_active', 'connectivity',
          'created_by', 'date_created', 'comment',
          'org_name', 'actions'
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
            formatter: (row) => {
              let data = row.protocols.map(item => item.name + '/' + item.port)
              data = data.join(', ')
              return <span> {data} </span>
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
        searchConfig: {
          getUrlQuery: false
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
      const config = _.merge(this.defaultConfig, this.tableConfig, {
        url: this.url,
        category: this.category
      })
      if (this.addColumns.length > 0) {
        config.columns = [
          ...config.columns.slice(0, 2),
          ...this.addColumns,
          ...config.columns.slice(2)
        ]
      }
      if (Object.keys(this.addColumnsMeta).length > 0) {
        config.columnsMeta = _.merge(config.columnsMeta, this.addColumnsMeta)
      }
      return config
    },
    iHeaderActions() {
      const actions = _.merge({}, this.defaultHeaderActions, this.headerActions)
      if (this.addExtraMoreActions) {
        actions.extraMoreActions = [...actions.extraMoreActions, ...this.addExtraMoreActions]
      }
      return actions
    }
  }
}
</script>

<style>

</style>
