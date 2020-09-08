<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/cmd-filters/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.Name'),
            formatter: DetailFormatter,
            showOverflowTooltip: true,
            sortable: true,
            formatterArgs: {
              route: 'CommandFilterDetail'
            }
          },
          {
            prop: 'rules',
            label: this.$t('assets.Rules'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'rules'
              },
              getTitle: ({ cellValue }) => cellValue.length
            }
          },
          {
            prop: 'system_users',
            label: this.$t('assets.SystemUsers'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CommandFilterDetail',
              getTitle: ({ cellValue }) => cellValue.length
            }
          },
          {
            prop: 'comment',
            showOverflowTooltip: true,
            label: this.$t('assets.Comment')
          },
          {
            prop: 'id',
            align: 'center',
            label: this.$t('assets.Action'),
            formatter: ActionsFormatter,
            width: '200px',
            formatterArgs: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/cmd-filters/${id}/`
                return this.$axios.delete(url).then(res => {
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                  window.location.reload()
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
                })
              }
            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasBulkDelete: false,
        hasSearch: true,
        hasMoreActions: false,
        createRoute: 'CommandFilterCreate'
      }
    }
  },
  computed: {
    title() {
      return this.$t('assets.CommandFilterHelpMessage')
    }
  }
}
</script>

<style>

</style>
