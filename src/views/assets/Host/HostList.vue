<template>
  <GenericListPage
    :table-config="tableConfig"
    :header-actions="headerActions"
    :help-message="notice"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter, DetailFormatter, TagsFormatter } from '@/components/TableFormatters'
import { connectivityMeta } from '@/components/AccountListTable/const'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/hosts/',
        columns: [
          'hostname', 'ip', 'public_ip', 'admin_user_display',
          'protocols', 'category', 'type', 'platform', 'sn',
          'is_active', 'connectivity', 'labels_display',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['hostname', 'ip', 'actions'],
          default: [
            'hostname', 'ip', 'platform', 'category', 'type',
            'connectivity', 'actions'
          ]
        },
        columnsMeta: {
          hostname: {
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
      headerActions: {
        hasMoreActions: false,
        createRoute: 'HostCreate'
      }
    }
  }
}
</script>

<style>

</style>
