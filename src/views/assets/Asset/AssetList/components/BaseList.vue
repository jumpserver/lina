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
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'View',
                  title: this.$t(`common.UpdateAssetDetail`),
                  type: 'primary',
                  can: vm.$hasPerm('assets.refresh_assethardwareinfo'),
                  callback: function({ cellValue, tableData, row }) {
                    return this.$router.push({ name: 'AssetMoreInformationEdit', params: { id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      defaultHeaderActions: {
        hasMoreActions: false,
        createRoute: 'HostCreate',
        onCreate: () => {
          this.showPlatform = true
        }
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
